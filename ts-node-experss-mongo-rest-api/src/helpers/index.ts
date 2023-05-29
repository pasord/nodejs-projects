import crypto from "crypto"; // 在 ts-node 包里

const SECRET = "PASORD-REST_API";

// 生成 salt
export const random = () => crypto.randomBytes(128).toString("base64");
// 加密 password
export const authentication = (salt: string, password: string) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};
