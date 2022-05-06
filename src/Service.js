const fs = require('fs')
const Koa = require('koa')
const path = require('path')
const parser = require('koa-bodyparser')
const Router = require('koa-router')
const static = require('koa-static')
const { AutoAnswer, urls, QuestionBanks } = require('./autoAnswer')
const jsonFormat = require('json-format')
const http = require('http')
let app = new Koa()
let router = new Router()
app.use(static('./static', { extensions: ['html', 'js'] }))
app.use(parser({ enableTypes: ['json'] }))
let StartUp = async (ctx, next) => {
    let { user, paswd } = ctx.request.body
    let check = await new AutoAnswer(user,paswd).login()
    if (check == 'error') {
        ctx.body = '密码或账号错误'
    } else {
        let config_file = JSON.parse(fs.readFileSync(path.resolve(__dirname, './user.json'), { encoding: 'utf-8', flag: 'r' }))
        console.log(config_file);
        if (!config_file.some(itme => itme.user == user)) {
            config_file.push({user,paswd})
            fs.writeFile(path.resolve(__dirname, './user.json'), jsonFormat(config_file), { encoding: 'utf-8', flag: "w" }, err => {
                if (err) console.log(err);
            })
            try {
                new AutoAnswer(user, paswd).main()
            } catch (e) {
                if (e) console.log(e);
            }
            ctx.body = '白嫖开始...,大概完成时间为61*12+240*12秒'
            
        }else{
            ctx.body = '已经在白嫖了'
        }
        
    }
}
router.post('/autoAnswer', StartUp)
app.use(router.routes())
app.listen(9013, '0.0.0.0', () => {
    console.log('Prot_9013');
})