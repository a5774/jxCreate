/* 
    @author laofan
    @CreateTime 2020/5/4
    @Done 2020 5/5
*/
const EventEm = require('events')
const http = require('http')
const fs = require('fs')
let urls = {
    login: 'http://jxstnutd.com:9013/user/login',
    index: 'http://jxstnutd.com:9013/',
    problem: 'http://jxstnutd.com:9013/problem/submit/1003',
    submit: 'http://jxstnutd.com:9013/solution/submit/1003',
    user_passwd: '2032010317',
    passwd: null
}
let eventNext = new EventEm()
let QuestionBanks = require('./QuestionBank.json')
class AutoAnswer {
    constructor(username, passwd) {
        this.codes = {
            // sourcecdode,code nothing useful
            sourcecdode: '%23include%3Cstdio.h%3E%0D%0Avoid+main%28%29%0D%0A%7B%0D%0A++++printf%28%22hello+world%22%29%3B%0D%0A%7D',
            code: '%23include%3Cstdio.h%3E%0D%0Avoid+main%28%29%0D%0A%7B%0D%0A++++printf%28%22hello+world%22%29%3B%0D%0A%7D',
        }
        this.username = username
        this.passwd = passwd
        this.token = ''
        this.doneTime = 25.0
        this.time_ms = 12000
        try {
            this.main()
        } catch (e) {
            if (e) console.log(e);
        }

    }
    async login() {
        // As Client
        http.ClientRequest
        // req
        return new Promise((reslove, rej) => {
            let req = http.request(urls.login, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            req.write(`username=${this.username}&password=${this.passwd}&referer=`)
            req.end()
            req.addListener('response', res => {
                // http.IncomingMessage 
                // res    
                reslove(
                    res.headers['set-cookie'].map(item => {
                        return item.split(';')[0]
                    })
                )
            })
        })

    }
    async __RequestVerificationToken([_oj_bs, _oj_], url) {
        return new Promise((reslove, rej) => {
            let data_ = ''
            let req = http.get(url, {
                headers: {
                    'Cookie': `${_oj_bs};${_oj_}`
                }
            })
            req.addListener('response', res => {
                res.addListener('data', data => {
                    //Generator realVerifytoken
                    data_ += data.toString()
                })
                // data consume
                res.addListener('end', () => {
                    data_ = data_.match(/value="\S{108}"/).map(item => {
                        return item.replace(/"/g, '').split('=')[1]
                    })
                    // console.log(...data_);
                    reslove(
                        [
                            ...res.headers['set-cookie'].map(item => {
                                return item.split(';')[0]
                            }),
                            ...data_
                        ]
                    )
                })

            })
        })
    }
    async solution_submit([vfyToken, realToken], [_oj_bs, _oj_], { sourcecdode, code, time }, url) {
        // console.log(vfyToken);
        // console.log(_oj_,_oj_bs)
        let body = `__RequestVerificationToken=${realToken}&lang=0&sourcecode=${sourcecdode}&code=${code}&time=${this.doneTime}`
        let req = http.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': `${_oj_bs};${vfyToken};${_oj_}`
            }
        })
        req.write(body)
        req.end()
        req.addListener('response', res => {
            res.addListener('data', data => {
                console.log(url+'done');
            })
        })
    }
    async submitGenerator() {
        // generator plain
        /*  let self = this
         function * gen(){
             for (let i = 0; i<= QuestionBanks.length ;i++){
                 yield async function(){
                     let {problem,submit}= QuestionBanks[i]
                     // console.log(perblem,submit);
                     let verifyToken = await self.__RequestVerificationToken(token, problem)
                     await self.solution_submit(verifyToken, token, codes, submit)    
                 }
             }
          }
         //  gen().next().value() */
    }
    async submitSetInterval(init = 0) {

        let stop = setInterval(async () => {
            // stop and enter next handler 
            if (init > QuestionBanks.length) {
                clearImmediate(stop)
                eventNext.emit('Done')
            }
            let { problem, submit } = QuestionBanks[init]
            this.verifyToken = await this.__RequestVerificationToken(this.token, problem)
            await this.solution_submit(this.verifyToken, this.token, this.codes, submit)
            init++
        }, this.time_ms)
        // function is return ，but async task still In the async task queue
        return null
    }
    async loop_sub_() {
        setInterval(async () => {
            let verifyToken = await this.__RequestVerificationToken(this.token, urls.problem)
            this.solution_submit(verifyToken, this.token, this.codes, urls.submit)
        }, this.time_ms)
    }

    async main() {
        // next task 
        eventNext.once('Done', () => {
            // 300 submit target: default 1003
            this.loop_sub_()
        })
        // login
        this.token = await this.login()
        // 61 Answer
        /* 
            @params subject init pos 
        */
        this.submitSetInterval(0);
    }

}

// new auto_Answer(urls.user_passwd, urls.user_passwd)
let data = fs.readFileSync('./user.json',{encoding:'utf-8',flag:'r+'})
// Object deep Copy use JSON.parse()
for (const iter of JSON.parse(data)) {
    new AutoAnswer(iter.user,iter.paswd)
}
// new AutoAnswer(2032010301, 2032010301)
// new AutoAnswer(2037030111, 2037030111)


// http.Server
// http.ClientRequest extends http.IncomingMessage

// http.ServerResponse extends http.OutgoingMessage


/* // As  Server
let server  = http.createServer((req,res)=>{
    // http.IncomingMessage
    // req
    // http.ServerResponse
    // res
})
server.listen()
// server request
server.addListener('request',req=>{
    // http.IncomingMessage
    // req
})

 */
/* const fs = require('fs')
for (let index = 0; index <= 61; index++) {
    let nmb = index.toString().padStart(2,'0')
    let ques = {
        problem:`http://jxstnutd.com:9013/problem/submit/10${nmb}`,
        submit:`http://jxstnutd.com:9013/solution/submit/10${nmb}`
    }
    fs.writeFileSync('./QuestionBank.json',`${JSON.stringify(ques)},`,{encoding:'utf-8',flag:'a'})


} */








