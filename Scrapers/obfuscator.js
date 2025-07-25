const axios = require('axios');


async function obfuscateJS(jsCode) {
  const payload = {
    sourceFile: {
      name: "online-demo.js",
      source: jsCode
    },
    protectionConfiguration: {
      settings: {
        booleanLiterals: { randomize: true },
        integerLiterals: { radix: "none", randomize: true, lower: null, upper: null },
        debuggerRemoval: true,
        stringLiterals: true,
        propertyIndirection: true,
        localDeclarations: { nameMangling: "base52" },
        controlFlow: { randomize: true },
        constantArgument: true,
        domainLock: false,
        functionReorder: { randomize: true },
        propertySparsing: true,
        variableGrouping: true
      }
    }
  };

  try {
    const response = await axios.post(
      'https://jsd-online-demo.preemptive.com/api/protect',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://jsd-online-demo.preemptive.com',
          'Referer': 'https://jsd-online-demo.preemptive.com/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; ...) Chrome/137.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      }
    );

    return response.data.protectedCode;
  } catch (error) {
    throw new Error(
      "Failed to obfuscate: " + (error.response?.data?.message || error.message)
    );
  }
}

module.exports = { obfuscateJS };