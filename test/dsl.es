// SQL for selecting all records that have null account numbers
POST _sql?format=txt
{
    "query": "SELECT * FROM accounts WHERE account_number IS NULL"
}

// Translate SQL to DSL (Domain Specific Language)
POST _sql/translate
{
    "query": "SELECT * FROM accounts WHERE account_number IS NULL"
} 

// DSL code to delete all records that have null account numbers
POST accounts/_delete_by_query
{
    "query": {
        "bool": {
            "must_not": [
                {
                    "exists": {
                        "field": "account_number"
                    }
                }
            ]
        }
    }
}

/*  match/must  */
// show me everything
GET accounts/_search

// find CA accounts only
GET accounts/_search
{
    "query": {
        "match": {
            "state": "CA"
        }
    }
}

// find "Techade" accounts in CA only
GET accounts/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "state": "CA"
                    }
                },
                {
                    "match": {
                        "employer": "Techade"
                    }
                }
            ]
        }
    }
}

// find non "Techade" accounts outside of CA
GET accounts/_search
{
    "query": {
        "bool": {
            "must_not": [
                {
                    "match": {
                        "state": "CA"
                    }
                },
                {
                    "match": {
                        "employer": "Techade"
                    }
                }
            ]
        }
    }
}


// let's combine them to search for non "Techade" accounts inside CA
GET accounts/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "state": "CA"
                    }
                }
            ],
            "must_not": [
                {
                    "match": {
                        "employer": "Techade"
                    }
                }
            ]
        }
    }
}

// Boost results for Smith
GET accounts/_search
{
    "query": {
        "bool": {
            "should": [
                {
                    "match": {
                        "state": "CA"
                    }
                },
                {
                    "match": {
                        "lastname": {
                            "query": "Smith",
                            "boost": 3
                        }
                    }
                }
            ]
        }
    }
}

/* Term Query */
GET accounts/_search
{
    "query": {
        "term": {
            "account_number": 516
        }
    }
}

// Returns null because "state" is a text field (hence not an exact match)
GET accounts/_search
{
    "query": {
        "term": {
            "state": "RI"
        }
    }
}

// This works because it uses the "analysis" process
GET accounts/_search
{
    "query": {
        "match": {
            "state": "RI"
        }
    }
}

// Terms can return multiple results
GET accounts/_search
{
    "query": {
        "terms": {
            "account_number": [
                516,
                851
            ]
        }
    }
}


// Range Queries
// gte = Greater-than or equal to
// gt = Greater-than
// lte = Less-than or equal to
// lt = Less-than

// Show all accounts between 516 and 851, boosting the importance
GET accounts/_search
{
    "query": {
        "range": {
            "account_number": {
                "gte": 516,
                "lte": 851,
                "boost": 2
            }
        }
    }
}

// Show all account holders older than 35
GET accounts/_search
{
  "query": {
    "range": {
      "age": {
        "gt": 35
      }
    }
  }
}


/* aggregation */

// Count of Accounts by State
// Must be keyword field
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "states": {
            "terms": {
                "field": "state",
                "size": 20
            }
        }
    }
}

// Add average balance in each state
// Nesting the metric inside the agg
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "states": {
            "terms": {
                "field": "state"
            },
            "aggs": {
                "avg_bal": {
                    "avg": {
                        "field": "balance"
                    }
                }
            }
        }
    }
}

// Breakdown further with Nesting
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "states": {
            "terms": {
                "field": "state"
            },
            "aggs": {
                "avg_bal": {
                    "avg": {
                        "field": "balance"
                    }
                },
                "age": {
                    "terms": {
                        "field": "age"
                    }
                }
            }
        }
    }
}

// Add avg_price metric to lowest level
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "states": {
            "terms": {
                "field": "state"
            },
            "aggs": {
                "avg_bal": {
                    "avg": {
                        "field": "balance"
                    }
                },
                "age": {
                    "terms": {
                        "field": "age"
                    },
                    "aggs": {
                        "avg_bal": {
                            "avg": {
                                "field": "balance"
                            }
                        }
                    }
                }
            }
        }
    }
}


// Get stats about bank balances
// Size=1 to omit search results
GET accounts/_search
{
    "size": 1,
    "aggs": {
        "balance-stats": {
            "stats": {
                "field": "balance"
            }
        }
    }
}


// Count of Accounts by State
// Must be keyword field
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "states": {
            "terms": {
                "field": "state"
            }
        }
    }
}

// This is the equivalent of using match_all
GET accounts/_search
{
    "size": 0,
    "query": {
        "match_all": {}
    },
    "aggs": {
        "states": {
            "terms": {
                "field": "state"
            }
        }
    }
}

// Aggs work in the context of the query, so apply a filter like normal
GET accounts/_search
{
    "size": 0,
    "query": {
        "match": {
            "state": "CA"
        }
    },
    "aggs": {
        "states": {
            "terms": {
                "field": "state"
            }
        }
    }
}

// You can also filter on terms
GET accounts/_search
{
    "size": 0,
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "state": "CA"
                    }
                },
                {
                    "range": {
                        "age": {
                            "gt": 35
                        }
                    }
                }
            ]
        }
    },
    "aggs": {
        "states": {
            "terms": {
                "field": "state"
            }
        }
    }
}

// Lets add a metric back in
GET accounts/_search
{
    "size": 0,
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "state": "CA"
                    }
                },
                {
                    "range": {
                        "age": {
                            "gt": 35
                        }
                    }
                }
            ]
        }
    },
    "aggs": {
        "states": {
            "terms": {
                "field": "state"
            },
            "aggs": {
                "avg_bal": {
                    "avg": {
                        "field": "balance"
                    }
                }
            }
        }
    }
}


// Look at state avg and global average
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "state_avg": {
            "terms": {
                "field": "state"
            },
            "aggs": {
                "avg_bal": {
                    "avg": {
                        "field": "balance"
                    }
                }
            }
        },
        "global_avg": {
            "global": {},
            "aggs": {
                "avg_bal": {
                    "avg": {
                        "field": "balance"
                    }
                }
            }
        }
    }
}

// Look at the percentiles for the balances
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "pct_balances": {
            "percentiles": {
                "field": "balance",
                "percents": [
                    1,
                    5,
                    25,
                    50,
                    75,
                    95,
                    99
                ]
            }
        }
    }
}


// We can use the percentile ranks agg for checking a individual values
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "bal_outlier": {
            "percentile_ranks": {
                "field": "balance",
                "values": [
                    35000,
                    50000
                ]
            }
        }
    }
}

// Similarly we can create a histogram
GET accounts/_search
{
    "size": 0,
    "aggs": {
        "bals": {
            "histogram": {
                "field": "balance",
                "interval": 500
            }
        }
    }
}


/* analyzing and tokenization */
// Basic Example
GET /_analyze
{
    "tokenizer": "standard",
    "text": "The Moon is Made of Cheese Some Say"
}

// Mixed String
GET /_analyze
{
    "tokenizer": "standard",
    "text": "The Moon-is-Made of Cheese.Some Say$"
}

// Uset the letter tokenizer
GET /_analyze
{
    "tokenizer": "letter",
    "text": "The Moon-is-Made of Cheese.Some Say$"
}

// How about a URL
GET /_analyze
{
    "tokenizer": "standard",
    "text": "you@example.com login at https://bensullins.com attempt"
}

GET /_analyze
{
    "tokenizer": "uax_url_email",
    "text": "you@example.com login at https://bensullins.com attempt"
}

// Where it breaks, two fields with diff analyzers
PUT /idx1
{
    "mappings": {
        "properties": {
            "title": {
                "type": "text",
                "analyzer": "standard"
            },
            "english_title": {
                "type": "text",
                "analyzer": "english"
            }
        }
    }
}

GET idx1

GET idx1/_analyze
{
    "field": "title",
    "text": "Bears"
}

GET idx1/_analyze
{
    "field": "english_title",
    "text": "Bears"
}
