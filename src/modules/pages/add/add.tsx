import { View } from "@tarojs/components";
import { Button, Cell, Field, Input, Form } from "@taroify/core";
import { useState } from "react";
import { TOTP, URI } from "otpauth";
import { navigateBack, showToast } from "@tarojs/taro";

import "./add.scss";
import Layout from "../../../components/layout";
import { addSecret } from "../../../storage/secret";

export default function Add() {
  const [account, setAccount] = useState("");
  const [secret, setSecret] = useState("");
  const [issuer, setIssuer] = useState("");
  const submit = async () => {
    const uri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
    const totp = URI.parse(uri) as TOTP;
    await addSecret(totp);
    await showToast({
      title: "添加成功",
      icon: "success",
    });
    setTimeout(async () => {
      await navigateBack({});
    }, 2000);
  };
  return (
    <Layout title="添加两步验证码">
      <View className="main">
        <Form onSubmit={() => {}}>
          <Cell.Group inset>
            <Form.Item
              name="account"
              rules={[{ required: true, message: "请填写账户" }]}
            >
              <Form.Label>账户</Form.Label>
              <Form.Control>
                <Input
                  value={account}
                  onChange={(e) => setAccount(e.detail.value)}
                />
              </Form.Control>
            </Form.Item>
            <Form.Item
              name="secret"
              rules={[{ required: true, message: "请填写密钥" }]}
            >
              <Form.Label>密钥</Form.Label>
              <Form.Control>
                <Input
                  password
                  value={secret}
                  onChange={(e) => setSecret(e.detail.value)}
                />
              </Form.Control>
            </Form.Item>
            <Field name="issuer" label={{ align: "left", children: "颁发者" }}>
              <Input
                value={issuer}
                onChange={(e) => setIssuer(e.detail.value)}
              />
            </Field>
          </Cell.Group>
          <View style={{ margin: "16px" }}>
            <Button
              onClick={submit}
              shape="round"
              block
              color="primary"
              formType="submit"
            >
              提交
            </Button>
          </View>
        </Form>
      </View>
    </Layout>
  );
}