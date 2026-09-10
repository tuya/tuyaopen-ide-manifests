# 登录 (login)

### login

调用接口获取登录凭证，通过凭证进而换取用户登录态信息。

> 需引入`MiniKit`，且在`>=2.3.2`版本才可使用

> <font style="color: red">注意：在开发小程序前，请先确保已经将小程序与云项目进行关联。</font>

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| timeout  | `number`   |        | 否   | 超时时间，单位ms                                 |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

**object.success回调参数**

**参数**

**Object res**

| 属性 | 类型     | 说明                         |
| ---- | -------- | ---------------------------- |
| code | `string` | 用户登录凭证（有效期五分钟） |

#### 示例代码

```js | pure
import {
  getStorageSync,
  getSystemInfoSync,
  login,
  removeStorageSync,
  request,
  setStorageSync,
  getUserInfo,
  showModal,
} from '@ray-js/ray';

const { code } = await login({});
const { nickName, avatorUrl } = new Promise((resolve, reject) =>
  getUserInfo({ success: resolve, fail: reject }),
);
request({
  // 开发者服务器登录接口
  url: `https://wwww.xxx.com/login`,
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
  },
  data: JSON.stringfy({
    code,
    nickName,
    avatorUrl,
  }),
  success: ({ data }: any) => {
    // 由于小程序没有 cookie，这时使用 storage 管理登录态
    setStorageSync({
      key: 'session',
      data,
    });
  },
  fail: () => {
    showModal({
      title: '提示',
      content: '登录失败',
      showCancel: false,
    });
  },
});
```
