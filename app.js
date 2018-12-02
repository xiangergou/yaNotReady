const Koa = require('koa');
const app = new Koa();
const superagent = require('superagent');
const TOPIC_IDS = [19554298, 19552330, 19565652, 19580349, 19939299, 19555547, 19594551, 19552832, 19577377, 19552826, 19615452];

const logger = require('koa-logger');

let page_no = 0;
let arr = [];


app.use(logger());

app.use(async (ctx) => {
  
  await get_answers_by_page().then(res => {
    // console.log(res, 'res')
    // let cb = ctx.request.query.callback;
    // ctx.type = 'text/javascript';
    // // ctx.body = cb + JSON.stringify(arr);
    // let data = JSON.stringify(arr);
    // console.log(cb + '(' + '"数据"' + ')')
    // console.log(`${cb} ( ${data} )`)
    // // ctx.body = `${cb}("${JSON.stringify(arr)}")`
    // ctx.body = `${cb} ( "${data}" )`

    // 如果jsonp 的请求为GET
    if (ctx.method === 'GET' && ctx.url.split('?')[0] === '/getData.jsonp') {

      // 获取jsonp的callback
      let callbackName = ctx.query.callback || 'callback'
      let returnData = {
        success: true,
        data: {
          text: 'this is a jsonp api',
          time: new Date().getTime(),
          arr
        }
      }

      // jsonp的script字符串
      let jsonpStr = `;${callbackName}(${JSON.stringify(returnData)})`

      // 用text/javascript，让请求支持跨域获取
      ctx.type = 'text/javascript'

      // 输出jsonp字符串
      ctx.body = jsonpStr

    } else {

      ctx.body = 'hello jsonp'

    }
  })

  
})



async function get_answers_by_page () {
  offset = page_no * 10;
  console.log(`开始爬取第${page_no}页`);
  let url = `https://www.zhihu.com/api/v4/topics/19554298/feeds/essence?include=data%5B%3F(target.type%3Dtopic_sticky_module)%5D.target.data%5B%3F(target.type%3Danswer)%5D.target.content%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%3Bdata%5B%3F(target.type%3Dtopic_sticky_module)%5D.target.data%5B%3F(target.type%3Danswer)%5D.target.is_normal%2Ccomment_count%2Cvoteup_count%2Ccontent%2Crelevant_info%2Cexcerpt.author.badge%5B%3F(type%3Dbest_answerer)%5D.topics%3Bdata%5B%3F(target.type%3Dtopic_sticky_module)%5D.target.data%5B%3F(target.type%3Darticle)%5D.target.content%2Cvoteup_count%2Ccomment_count%2Cvoting%2Cauthor.badge%5B%3F(type%3Dbest_answerer)%5D.topics%3Bdata%5B%3F(target.type%3Dtopic_sticky_module)%5D.target.data%5B%3F(target.type%3Dpeople)%5D.target.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics%3Bdata%5B%3F(target.type%3Danswer)%5D.target.annotation_detail%2Ccontent%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%3Bdata%5B%3F(target.type%3Danswer)%5D.target.author.badge%5B%3F(type%3Dbest_answerer)%5D.topics%3Bdata%5B%3F(target.type%3Darticle)%5D.target.annotation_detail%2Ccontent%2Cauthor.badge%5B%3F(type%3Dbest_answerer)%5D.topics%3Bdata%5B%3F(target.type%3Dquestion)%5D.target.annotation_detail%2Ccomment_count&limit=10&offset=${offset}`;
  superagent.get(url)
    .end((err, sres) => { //页面获取到的数据
      let html = sres.text;
      let data = JSON.parse(html).data;
      if (data.length === 0) {
        return arr;
      } else {
        let effectiveData = data.filter(item => {
          return item.target.content.length < 200;
        })
        arr = [...arr, ...effectiveData];
        console.log(`当前页${data.length}条数据，共${arr.length}条有效数据`);
        page_no++;
        get_answers_by_page()
      }
  });
};

app.listen(9527);