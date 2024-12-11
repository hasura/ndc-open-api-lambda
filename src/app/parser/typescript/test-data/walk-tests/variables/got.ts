import path from "path";

function testFunction() {
  
}

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
  baseUrl: "https://api.example.com",
  params: {
    headers: {
      "Content-Type": "application/json",
    },
  },
};

const constNumbers: number[] = [1, 2, 3, 4, 5];

/**
 * @save
 * this variable should be preserved
 */
const constSavedNumbers: number[] = [11, 22, 33, 44, 55];

/**
 * Should not be present in the want file
 */
const constDeleteMe = "I should be deleted";

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

/**
 * This should be overwritten
 */
var varApi = {
  baseUrl: "https://api.example.com",
  params: {
    headers: {
      "Content-Type": "application/json",
    },
  },
};

/**
 * this variable should be overwritten
 */
var varNumbers: number[] = [1, 2, 3, 4, 5];

/**
 * @save
 * this variable should be preserved
 */
var varSavedNumbers: number[] = [111, 222, 333, 444, 555];

/**
 * Should not be present in the want file
 */
var varDeleteMe = "I should be deleted";

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

/**
 * This should be overwritten
 */
let letApi = {
  baseUrl: "https://api.example.com",
  params: {
    headers: {
      "Content-Type": "application/json",
    },
  },
};

/**
 * this variable should be overwritten
 */
let letNumbers: number[] = [1, 2, 3, 4, 5];

/**
 * @save
 * this variable should be preserved
 */
let letSavedNumbers: number[] = [1110, 2220, 3330, 4440, 5550];

/**
 * Should not be present in the want file
 */
let letDeleteMe = "I should be deleted";

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
