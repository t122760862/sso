const http = require('http')

const COOKIE_MAP = {
  test: '我是test账号',
  admin: '我是admin账号'
}

const app = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // console.log(req, 'req')
  if (req.url === '/login') {
    login(req, res)
  }

  if (req.url === '/getInfo') {
    getInfo(req, res)
  }

  if (req.url === '/loginout') {
    loginout(req, res)
  }
})

app.listen(3000)

console.log('服务一起动,监听3000端口')

const ACCOUNT_MAP = {
  account: 'test',
  password: '12345'
}

function checkAccount(obj) {
  const { account, password } = obj

  if (account === ACCOUNT_MAP.account && password === ACCOUNT_MAP.password) return true
  return false
}

function login(req, res) {
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    body = JSON.parse(body)
    // at this point, `body` has the entire request body stored in it as a string
    if (checkAccount(body)) {
      res.setHeader('set-cookie', 'token=test;SameSite=None;Secure')
      res.write('{"code": "200"}')
      res.end()
      return
    }
    res.write('{"code": "201", "msg": "password error"}')
    res.end()
  });
}

async function getInfo(req, res) {
  if (await checkLogin(req, res)) {
    const [_key, value] = getToken(req)
    res.write(`{"code": "200", "info": "${COOKIE_MAP[value]}"}`)
    res.end()
  }
}

async function loginout(req, res) {
  if (await checkLogin(req, res)) {
    res.setHeader('set-cookie', 'token=;SameSite=None;Secure;Max-age=-1')
    res.write(`{"code": "200", "msg": "退出成功"}`)
    res.end()
  }
  res.end()
}

function checkLogin(req, res) {
  if (!req.headers.cookie) {
    res.write('{"code": "101", "msg: "没有登录"}')
    res.end()
    return Promise.resolve(false)
  }

  const [_key, value] = req.headers.cookie.split('=')

  if (COOKIE_MAP[value]) {
    return Promise.resolve(true)
  }


  res.write('{"code": "101", "msg: "没有登录"}')
  res.end()
}


function getToken(req) {
  if (!req.headers.cookie) return ''
  return req.headers.cookie.split('=')
}
