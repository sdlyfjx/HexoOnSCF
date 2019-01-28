'use strict';
const {
    promisify
} = require('util')
const URL = require('url')
const path = require('path')
const YAML = require('js-yaml')
const fs = require('hexo-fs')
const front = require('hexo-front-matter')

const configPath = __dirname + '/_config.yml'
var _config = YAML.safeLoad(fs.readFileSync(configPath))

const HEXO = require('hexo')
// Hexo的db.json存储目录
const dbDir = '/tmp'
// Hexo的本地post目录路径
const postsDir = _config.source_dir + '/_posts/'
// Hexo配置的本地public目录
const publicDir = _config.public_dir + '/'
// Hexo生成文件中需要上传到cos的目录，在本项目中是*/public/blog/部署到COS上的本地对应的目录
const deployDir = publicDir + _config.cos_v5.deployPrefix

const COS = require('cos-nodejs-sdk-v5')
var cos = new COS({
    Bucket: _config.cos_v5.bucket,
    Region: _config.cos_v5.region,
    SecretId: _config.cos_v5.secretId,
    SecretKey: _config.cos_v5.secretKey
})
const cosGetObject = promisify(cos.getObject).bind(cos)
const cosPutObject = promisify(cos.putObject).bind(cos)

const cdn = require('qcloud-cdn-node-sdk')
cdn.config({
    secretId: _config.cos_v5.secretId,
    secretKey: _config.cos_v5.secretKey
})
const cdnHost = _config.url
// 将cdn.request转换为promise，由于回调函数为非标准格式（err,data)，不使用promisify
const RefreshCdnUrlSync = function (urls) {
    return new Promise((resolve, reject) => {
        cdn.request('RefreshCdnUrl', urls, (res) => {
            console.log('RefreshCdnUrlSync Result', res)
            let result = JSON.parse(res)
            if (result.code == 0) {
                resolve(result)
            } else {
                reject(result)
            }
        })
    })
}
const RefreshCdnDirSync = function (dirs) {
    return new Promise((resolve, reject) => {
        cdn.request('RefreshCdnDir', dirs, (res) => {
            console.log('RefreshCdnDirSync Result', res)
            let result = JSON.parse(res)
            if (result.code == 0) {
                resolve(result)
            } else {
                reject(result)
            }
        })
    })
}

exports.main_handler = async (event, context, callback) => {
    console.log("Hello World")
    console.log(JSON.stringify(event))
    // console.log(JSON.stringify(event.Records[0].cos))
    // console.log(context)

    const regCreate = /cos:ObjectCreated.*/
    const regRemove = /cos:ObjectRemove.*/
    const regDelete = /cos:ObjectDeleted.*/

    for (let record of event['Records']) {
        let eventName = record['event']['eventName']
        let key = record['cos']['cosObject']['key']
        let url = record['cos']['cosObject']['url']
        let path = URL.parse(url).pathname
        let paths = path.split('/')

        if (regCreate.test(eventName)) {
            // 如果是创建事件
            if (paths[1] == 'res' && paths[paths.length - 1].indexOf('.md')) {
                //如果是/res目录下的.md文件，则调用Hexo
                await scfHexo(key)
            } else if (paths[paths.length - 1].indexOf('.draft') || paths[paths.length - 1] == '') {
                // 如果是目录的创建或草稿文件，则不做处理
                return
            } else {
                // 如果是其他目录下的文件的创建，则调用接口刷新CDN
                await scfRefreshCDN(path, paths)
            }
        } else if (regRemove.test(eventName) || regDelete.test(eventName)) {
            // 如果是删除事件，则刷新CDN，及时让链接过期
            await scfRefreshCDN(path, paths)
        }
    }

    return
}

/**
 * 当用户上传文章到source目录下时，调用此方法，通过Hexo生成文件并部署
 */
async function scfHexo(key) {
    console.log('onCreateMarkdown')
    // 初始化文件目录
    if (!fs.existsSync(postsDir))
        // 创建_posts目录
        fs.mkdirsSync(postsDir)
    if (!fs.existsSync(deployDir))
        // 创建deploy目录
        fs.mkdirsSync(deployDir)

    let hexo = new HEXO(__dirname, {
        debug: false,
        safe: false,
        silent: true,
        config: configPath,
        output: dbDir
    })

    console.log('init')
    await hexo.init()
    // COS下载触发文件到_posts目录
    console.log('download')
    let sourcepath = await download(key)
    console.log(sourcepath)
    // 读取文件头的abbrlink字段
    let sourcefile = fs.readFileSync(sourcepath)
    console.log('source file content length', sourcefile.length)
    let abbrlink = front.parse(sourcefile).abbrlink
    console.log('abbrlink is ', abbrlink)
    if (!abbrlink) {
        await hexo.exit()
        fs.unlinkSync(sourcepath)
        return
    }
    // Hexo 生成
    console.log('generate')
    await hexo.call('generate')
    // Hexo 退出。
    console.log('exit')
    await hexo.exit()
    // 删除source文件
    fs.unlinkSync(sourcepath)

    // let res = fs.listDirSync(dbDir)
    // console.log(res)

    // 上传 COS并将生成的数据删除
    console.log('deploy')
    await deploy(abbrlink)

    return
}


async function scfRefreshCDN(path, paths) {
    console.log('Start scfRefreshCDN', path, paths)
    let urlObj = {}
    // 从cos上传的图片中，获取key并添加到urlObj中
    urlObj[`urls.0`] = cdnHost + path
    if (paths[1] == 'blog' && paths[paths.length - 1] != '') {
        //如果是blog目录下的文!件!则一并刷新其父目录
        paths.pop()
        urlObj[`urls.1`] = cdnHost + paths.join('/') + '/'
    }
    console.log(urlObj)
    if (Object.keys(urlObj).length > 0) {
        let result = await RefreshCdnUrlSync(urlObj)
        console.log(result)
    }
    return
}

/**
 * 首先清空本地_post目录，然后下载新增的markdown源文件
 * @param {string} key 
 */
async function download(key) {
    let keys = key.split("/")
    keys.splice(0, 3) //去掉前面的appid和bucketname
    let pmKey = '/' + keys.join('/')
    let pmOutput = postsDir + keys[keys.length - 1]
    let params = {
        Bucket: _config.cos_v5.bucket,
        Region: _config.cos_v5.region,
        Key: pmKey,
        Output: pmOutput
    }
    console.log('download function params:', params)
    // 下载变更文件
    let result = await cosGetObject(params)
    console.log('download function result', result)
    return pmOutput
}

/**
 * 将本地deployDir/abbrlink/下的所有生成文件上传到COS的目录下
 */
async function deploy(abbrlink) {
    let localFileMap = new Map()
    let deploy = deployDir + abbrlink + '/'
    if (!fs.existsSync(deploy))
        return
    // 获取本地文件
    getFiles(deploy, (file) => {
        localFileMap.set(
            getUploadPath(file, path.basename(deploy)),
            file
        )
    })
    console.log('deploy localFileMap:', localFileMap)
    // 上传新生成的blog文件
    localFileMap.forEach(async (filepath, file) => {
        await cosPutObject({
            Bucket: _config.cos_v5.bucket,
            Region: _config.cos_v5.region,
            Key: file,
            Body: fs.createReadStream(filepath),
            ContentLength: fs.statSync(filepath).size,
        })
    })
    // 上传新的index.html文件
    let filepath = publicDir + 'index.html'
    if (fs.existsSync(filepath))
        await cosPutObject({
            Bucket: _config.cos_v5.bucket,
            Region: _config.cos_v5.region,
            Key: 'index.html',
            Body: fs.createReadStream(filepath),
            ContentLength: fs.statSync(filepath).size,
        })
}

/**
 * 遍历目录，获取文件列表
 * @param {string} dir
 * @param {function}  callback
 */
function getFiles(dir, callback) {
    let files = fs.listDirSync(dir);
    files.forEach((filePath) => {
        let absPath = path.join(dir, filePath);
        let stat = fs.statSync(absPath);
        if (stat.isDirectory()) {
            uploadFiles(absPath, callback);
        } else {
            callback(absPath);
        }
    });
}

/**
 * 获取上传文件的路径
 * @param {string} absPath
 * @param {string} root
 * @return {string}
 */
function getUploadPath(absPath, root) {
    let pathArr = absPath.split(path.sep);
    let rootIndex = pathArr.indexOf(root);
    pathArr = pathArr.slice(rootIndex - 1);
    return pathArr.join('/');
}