import { View } from "@tarojs/components";
import {
  Button,
  Cell,
  Field,
  Input,
  Form,
  Toast,
  Popup,
  Picker,
} from "@taroify/core";
import { useState } from "react";
import { TOTP, URI } from "otpauth";
import { navigateBack } from "@tarojs/taro";

import "./add.scss";
import Layout from "../../../components/layout";
import { addOTP } from "../../../storages/otp";
import * as toast from "../../../components/toast";
import * as api from "../../../api/otp";

export default function Add() {
  const [account, setAccount] = useState("");
  const [secret, setSecret] = useState("");
  const [issuer, setIssuer] = useState("");
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [algorithm, setAlgorithm] = useState("SHA1");
  const [openPicker, setOpenPicker] = useState(false);
  const submit = async () => {
    const uri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&digits=${digits}&period=${period}&algorithm=${algorithm}`;
    const totp = URI.parse(uri) as TOTP;
    await addOTP(totp);
    await api.addOTPs([totp.toString()]);
    toast.success("添加成功");
    setTimeout(async () => {
      await navigateBack();
    }, 1000);
  };
  return (
    <Layout title="添加两步验证码" padding="0">
      <Toast id="toast" />
      <Form>
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
            <Input value={issuer} onChange={(e) => setIssuer(e.detail.value)} />
          </Field>
          <Field name="digits" label={{ align: "left", children: "长度" }}>
            <Input
              type="number"
              value={digits.toString()}
              onChange={(e) => setDigits(parseInt(e.detail.value))}
            />
          </Field>
          <Field name="period" label={{ align: "left", children: "周期" }}>
            <Input
              type="number"
              value={period.toString()}
              onChange={(e) => setPeriod(parseInt(e.detail.value))}
            />
          </Field>
          <Field
            name="algorithm"
            label={{ align: "left", children: "算法" }}
            onClick={() => setOpenPicker(true)}
          >
            <Input
              value={algorithm}
              readonly
              onChange={(e) => setAlgorithm(e.detail.value)}
            />
          </Field>
          <Popup
            open={openPicker}
            rounded
            placement="bottom"
            onClose={setOpenPicker}
          >
            <Popup.Backdrop />
            <Picker
              onCancel={() => setOpenPicker(false)}
              onConfirm={(v) => {
                setOpenPicker(false);
                setAlgorithm(v[0]);
              }}
            >
              <Picker.Toolbar>
                <Picker.Button>取消</Picker.Button>
                <Picker.Title>算法</Picker.Title>
                <Picker.Button>确认</Picker.Button>
              </Picker.Toolbar>
              <Picker.Column>
                <Picker.Option>SHA1</Picker.Option>
                <Picker.Option>SHA224</Picker.Option>
                <Picker.Option>SHA256</Picker.Option>
                <Picker.Option>SHA384</Picker.Option>
                <Picker.Option>SHA512</Picker.Option>
                <Picker.Option>SHA3-224</Picker.Option>
                <Picker.Option>SHA3-256</Picker.Option>
                <Picker.Option>SHA3-384</Picker.Option>
                <Picker.Option>SHA3-512</Picker.Option>
              </Picker.Column>
            </Picker>
          </Popup>
        </Cell.Group>
        <View style={{ margin: "16px" }}>
          <Button onClick={submit} shape="round" block color="primary">
            提交
          </Button>
          <Button
            shape="round"
            block
            color="warning"
            style={{ marginTop: "16px" }}
            onClick={() => {
              setAccount("");
              setSecret("");
              setIssuer("");
            }}
          >
            重置
          </Button>
        </View>
      </Form>
    </Layout>
  );
}
