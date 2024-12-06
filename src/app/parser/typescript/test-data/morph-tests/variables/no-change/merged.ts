import path from "path";

// ------ const tests ------

const constSavedApi = {
  baseUrl: "hello world!",
  params: {},
};

const constApi = {
  baseUrl: "https://production.my-api.com",
  params: {
    headers: {
      "Content-Type": "application/xml",
    },
  },
};

const constNumbers: number[] = [1, 22, 678, 4, 500000];

const constSavedNumbers: number[] = [0, 0, 456];

// ------ var tests ------

var varSavedApi = {
  baseUrl: "hello world!",
  params: {},
};

var varApi = {
  baseUrl: "https://production.my-api.com",
  params: {
    headers: {
      "Content-Type": "application/xml",
    },
  },
};

var varNumbers: number[] = [1, 22, 678, 4, 500000];

var varSavedNumbers: number[] = [0, 0, 456];

// ------ let tests ------

let letSavedApi = {
  baseUrl: "hello world!",
  params: {},
};

let letApi = {
  baseUrl: "https://production.my-api.com",
  params: {
    headers: {
      "Content-Type": "application/xml",
    },
  },
};

let letNumbers: number[] = [1, 22, 678, 4, 500000];

let letSavedNumbers: number[] = [0, 0, 456];
