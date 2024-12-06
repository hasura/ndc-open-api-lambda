import path from "path";

// ------ const tests ------

// ------ const tests ------

/**
 * @save
 * this variable should be preserved
 */
const constSavedApi = {
  baseUrl: `${process.env.NDC_OAS_BASE_URL}`,
  params: {
    headers: {
      "Content-Type": "application/json",
    },
  },
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

/**
 * @save
 * this variable should be preserved
 */
const constSavedNumbers: number[] = [11, 22, 33, 44, 55];

// ------ var tests ------

// ------ var tests ------

/**
 * @save
 * this variable should be preserved
 */
var varSavedApi = {
  baseUrl: `${process.env.NDC_OAS_BASE_URL}`,
  params: {
    headers: {
      "Content-Type": "application/json",
    },
  },
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

/**
 * @save
 * this variable should be preserved
 */
var varSavedNumbers: number[] = [111, 222, 333, 444, 555];

// ------ let tests ------

// ------ let tests ------

/**
 * @save
 * this variable should be preserved
 */
let letSavedApi = {
  baseUrl: `${process.env.NDC_OAS_BASE_URL}`,
  params: {
    headers: {
      "Content-Type": "application/json",
    },
  },
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

/**
 * @save
 * this variable should be preserved
 */
let letSavedNumbers: number[] = [1110, 2220, 3330, 4440, 5550];

/**
 * @save
 * Should be copied to the want file
 */
const constSaveMe = "I should be present (const)";

/**
 * @save
 * Should be copied to the want file
 */
const constSaveIndex = 123;

/**
 * @save
 * Should be copied to the want file
 */
const constSaveEnum: "a" | "b" | "c" = "a";

/**
 * @save
 * Should be copied to the want file
 */
var varSaveMe = "I should be present (var)";

/**
 * @save
 * Should be copied to the want file
 */
var varSaveIndex = 890;

/**
 * @save
 * Should be copied to the want file
 */
var varSaveEnum: "adb" | "wefa" | "vea" = "wefa";

/**
 * @save
 * Should be copied to the want file
 */
let letSaveMe = "I should be present (let)";

/**
 * @save
 * Should be copied to the want file
 */
let letSaveIndex = 12365431;

/**
 * @save
 * Should be copied to the want file
 */
let letSaveEnum: "wqre" | "wzv" | "8092345" = "8092345";
