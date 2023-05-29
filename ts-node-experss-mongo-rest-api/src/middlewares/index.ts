import express from "express";

import { get, merge } from "lodash";

import { getUserBySessionToken } from "../db/users";

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    // 返回的是 new Objectid("xxx"), 需要调用mongodb的方法内置方法 ObjectId.toString()返回字符串id https://www.mongodb.com/docs/manual/reference/method/ObjectId.toString/
    const currentUserId = get(req, "identity._id") as string;

    // 不存当前用户
    if (!currentUserId) {
      return res.sendStatus(403);
    }
    // 当前用户存在，且与id不相等
    // 为什么，应该这个需求就是只能删除当前用户...
    if (currentUserId.toString() !== id) {
      return res.sendStatus(403);
    }

    // 继续进栈下一个中间件
    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["PASORD-AUTH"];

    // 没 token 返回 403
    if (!sessionToken) {
      return res.sendStatus(403);
    }

    // 有 token
    const existingUser = await getUserBySessionToken(sessionToken);
    // 登录用户不存在
    if (!existingUser) {
      return res.sendStatus(403);
    }

    // 登录用户存在
    // 合并req上，并给到下一个中间件
    merge(req, { identity: existingUser });

    // 返回，并继续进栈下一个中间件
    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
