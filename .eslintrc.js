module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "warn",
            4
        ],
        "no-mixed-spaces-and-tabs": [
            "off"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "block-spacing": [
            "error",
            "always"
        ],
        "comma-spacing": [
            "error",
            { "before": false, "after": true }
        ],
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "array-bracket-spacing": [
            "error",
            "always"
        ],
        "computed-property-spacing": [
            "error",
            "always"
        ],
        "keyword-spacing": ["error", { "overrides": {
          "if": { "after": false },
          "for": { "after": false },
          "while": { "after": false }
        } }],
        "semi-spacing": [
            "error",
            {"before": false, "after": true}
        ],
        "space-before-blocks": [
            "error",
            "always"
        ],
        "space-in-parens": [
            "error",
            "always"
        ],
        "space-infix-ops":
            ["error", {"int32Hint": false}
        ],
        "arrow-spacing": [
            "error",
            { "before": true, "after": true }
        ]
    },
    "globals": {
        "getApp": true,
        "wx": true,
        "Page": true,
        "getCurrentPages": true
    }
};
