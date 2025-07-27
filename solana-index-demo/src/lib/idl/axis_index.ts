// src/lib/idl/axis_index.ts

export const IDL = {
  "address": "9tBJstf7q2MZXSmSECCLoXV5YMaEpQHNfWLwT33MLzdg",
  "metadata": {
    "name": "axis_index",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "deposit_and_mint",
      "discriminator": [
        97,
        126,
        119,
        210,
        67,
        186,
        64,
        23
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101,
                  45,
                  118,
                  54
                ]
              },
              {
                "kind": "const",
                "value": [
                  131,
                  249,
                  197,
                  176,
                  189,
                  247,
                  138,
                  22,
                  71,
                  17,
                  76,
                  240,
                  27,
                  30,
                  190,
                  107,
                  216,
                  166,
                  202,
                  248,
                  33,
                  164,
                  252,
                  190,
                  220,
                  23,
                  40,
                  134,
                  137,
                  32,
                  44,
                  75
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "user_usdc_ata",
          "writable": true
        },
        {
          "name": "user_index_ata",
          "writable": true
        },
        {
          "name": "vault_usdc",
          "writable": true
        },
        {
          "name": "vault_sol",
          "writable": true
        },
        {
          "name": "index_mint",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "usdc_amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize_fund",
      "discriminator": [
        212,
        42,
        24,
        245,
        146,
        141,
        78,
        198
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101,
                  45,
                  118,
                  54
                ]
              },
              {
                "kind": "const",
                "value": [
                  131,
                  249,
                  197,
                  176,
                  189,
                  247,
                  138,
                  22,
                  71,
                  17,
                  76,
                  240,
                  27,
                  30,
                  190,
                  107,
                  216,
                  166,
                  202,
                  248,
                  33,
                  164,
                  252,
                  190,
                  220,
                  23,
                  40,
                  134,
                  137,
                  32,
                  44,
                  75
                ]
              }
            ]
          }
        },
        {
          "name": "index_mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdc_mint"
        },
        {
          "name": "wsol_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "vault_usdc",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "state"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdc_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vault_sol",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "state"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "wsol_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "constituents",
          "type": {
            "array": [
              {
                "defined": {
                  "name": "ConstituentInput"
                }
              },
              2
            ]
          }
        },
        {
          "name": "rebalance_period_sec",
          "type": "i64"
        }
      ]
    },
    {
      "name": "log_index_level",
      "discriminator": [
        235,
        202,
        235,
        238,
        249,
        180,
        40,
        105
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101,
                  45,
                  118,
                  54
                ]
              },
              {
                "kind": "const",
                "value": [
                  131,
                  249,
                  197,
                  176,
                  189,
                  247,
                  138,
                  22,
                  71,
                  17,
                  76,
                  240,
                  27,
                  30,
                  190,
                  107,
                  216,
                  166,
                  202,
                  248,
                  33,
                  164,
                  252,
                  190,
                  220,
                  23,
                  40,
                  134,
                  137,
                  32,
                  44,
                  75
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "rebalance",
      "discriminator": [
        108,
        158,
        77,
        9,
        210,
        52,
        88,
        62
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        }
      ],
      "args": [
        {
          "name": "new_weights",
          "type": {
            "array": [
              "u16",
              2
            ]
          }
        }
      ]
    },
    {
      "name": "redeem",
      "discriminator": [
        184,
        12,
        86,
        149,
        70,
        196,
        97,
        225
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101,
                  45,
                  118,
                  54
                ]
              },
              {
                "kind": "const",
                "value": [
                  131,
                  249,
                  197,
                  176,
                  189,
                  247,
                  138,
                  22,
                  71,
                  17,
                  76,
                  240,
                  27,
                  30,
                  190,
                  107,
                  216,
                  166,
                  202,
                  248,
                  33,
                  164,
                  252,
                  190,
                  220,
                  23,
                  40,
                  134,
                  137,
                  32,
                  44,
                  75
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "_burn_amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "FundState",
      "discriminator": [
        3,
        254,
        145,
        43,
        146,
        96,
        162,
        104
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidWeights",
      "msg": "weights must sum to 10000 bps"
    },
    {
      "code": 6001,
      "name": "MathOverflow",
      "msg": "math overflow"
    },
    {
      "code": 6002,
      "name": "EmptySupply",
      "msg": "supply is zero"
    },
    {
      "code": 6003,
      "name": "Unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6004,
      "name": "InvalidPythAccount",
      "msg": "invalid pyth price account"
    },
    {
      "code": 6005,
      "name": "StalePrice",
      "msg": "stale price"
    }
  ],
  "types": [
    {
      "name": "Constituent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token_mint",
            "type": "pubkey"
          },
          {
            "name": "target_bps",
            "type": "u16"
          },
          {
            "name": "pyth_price_acc",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "ConstituentInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token_mint",
            "type": "pubkey"
          },
          {
            "name": "target_bps",
            "type": "u16"
          },
          {
            "name": "pyth_price_acc",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "FundState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "index_mint",
            "type": "pubkey"
          },
          {
            "name": "usdc_mint",
            "type": "pubkey"
          },
          {
            "name": "vault_usdc",
            "type": "pubkey"
          },
          {
            "name": "vault_sol",
            "type": "pubkey"
          },
          {
            "name": "constituents",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "Constituent"
                  }
                },
                2
              ]
            }
          },
          {
            "name": "rebalance_period_sec",
            "type": "i64"
          },
          {
            "name": "last_rebalance_ts",
            "type": "i64"
          },
          {
            "name": "nav_scale",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};