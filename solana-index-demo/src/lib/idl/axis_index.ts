// src/lib/idl/axis_index.ts

export const IDL = {
  
    "address": "12B8b2nhzn3iWcRuSKPenZAeKtePeuWUxxZusGdS3RkZ",
    "metadata": {
      "name": "axis_index",
      "version": "0.1.0",
      "spec": "0.1.0"
    },
    "instructions": [
      {
        "name": "close_fund",
        "discriminator": [
          230,
          183,
          3,
          112,
          236,
          252,
          5,
          185
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
                    57
                  ]
                },
                {
                  "kind": "const",
                  "value": [
                    0,
                    77,
                    9,
                    38,
                    195,
                    191,
                    93,
                    5,
                    241,
                    212,
                    18,
                    211,
                    155,
                    147,
                    90,
                    78,
                    165,
                    114,
                    252,
                    19,
                    41,
                    1,
                    26,
                    211,
                    112,
                    204,
                    29,
                    150,
                    72,
                    202,
                    77,
                    94
                  ]
                }
              ]
            }
          },
          {
            "name": "admin",
            "writable": true,
            "signer": true,
            "relations": [
              "state"
            ]
          }
        ],
        "args": []
      },
      {
        "name": "create_vaults",
        "discriminator": [
          79,
          9,
          204,
          64,
          64,
          120,
          98,
          137
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
                    57
                  ]
                },
                {
                  "kind": "const",
                  "value": [
                    0,
                    77,
                    9,
                    38,
                    195,
                    191,
                    93,
                    5,
                    241,
                    212,
                    18,
                    211,
                    155,
                    147,
                    90,
                    78,
                    165,
                    114,
                    252,
                    19,
                    41,
                    1,
                    26,
                    211,
                    112,
                    204,
                    29,
                    150,
                    72,
                    202,
                    77,
                    94
                  ]
                }
              ]
            }
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
            "writable": true
          },
          {
            "name": "vault_sol",
            "writable": true
          },
          {
            "name": "admin",
            "writable": true,
            "signer": true,
            "relations": [
              "state"
            ]
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
          }
        ],
        "args": []
      },
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
                    57
                  ]
                },
                {
                  "kind": "const",
                  "value": [
                    0,
                    77,
                    9,
                    38,
                    195,
                    191,
                    93,
                    5,
                    241,
                    212,
                    18,
                    211,
                    155,
                    147,
                    90,
                    78,
                    165,
                    114,
                    252,
                    19,
                    41,
                    1,
                    26,
                    211,
                    112,
                    204,
                    29,
                    150,
                    72,
                    202,
                    77,
                    94
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
                    57
                  ]
                },
                {
                  "kind": "const",
                  "value": [
                    0,
                    77,
                    9,
                    38,
                    195,
                    191,
                    93,
                    5,
                    241,
                    212,
                    18,
                    211,
                    155,
                    147,
                    90,
                    78,
                    165,
                    114,
                    252,
                    19,
                    41,
                    1,
                    26,
                    211,
                    112,
                    204,
                    29,
                    150,
                    72,
                    202,
                    77,
                    94
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
                    57
                  ]
                },
                {
                  "kind": "const",
                  "value": [
                    0,
                    77,
                    9,
                    38,
                    195,
                    191,
                    93,
                    5,
                    241,
                    212,
                    18,
                    211,
                    155,
                    147,
                    90,
                    78,
                    165,
                    114,
                    252,
                    19,
                    41,
                    1,
                    26,
                    211,
                    112,
                    204,
                    29,
                    150,
                    72,
                    202,
                    77,
                    94
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
                    57
                  ]
                },
                {
                  "kind": "const",
                  "value": [
                    0,
                    77,
                    9,
                    38,
                    195,
                    191,
                    93,
                    5,
                    241,
                    212,
                    18,
                    211,
                    155,
                    147,
                    90,
                    78,
                    165,
                    114,
                    252,
                    19,
                    41,
                    1,
                    26,
                    211,
                    112,
                    204,
                    29,
                    150,
                    72,
                    202,
                    77,
                    94
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
      },
      {
        "code": 6006,
        "name": "InvalidVaultAddress",
        "msg": "invalid vault address"
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