import express from "express";
import { createUser, getUserByEmail } from "../db/users"; // 📢 都是异步的
import { authentication, random } from "../helpers";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    // 如果已存在
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.sendStatus(400);
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password), // 加密 password
      },
    });

    // console.log("---rg>", user);

    return res.status(200).json(user).end(); // todo 没有返回 user
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.sendStatus(400);
    }

    // 选择出字段
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!user) {
      return res.sendStatus(400);
    }

    // 登录鉴权
    // 对比密码，密码是加密的，可在database查看
    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res.status(403);
    }

    // 用户密码能匹配
    const salt = random();
    // 生成token
    // _id 在 database 里有
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    // user的save方法， 保存 token，难道业务请求对比还需要从 database 里取
    // console.log("---lg>", user);
    await user.save();

    // token 放到 cookie 返回
    res.cookie("PASORD-AUTH", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
