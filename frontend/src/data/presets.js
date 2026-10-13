export const PRESETS = [
  {
    id: "factorial",
    title: "Factorial",
    subtitle: "Direct Recursion",
    tag: "Recursion",
    tagColor: "indigo",
    entryFunction: "fact",
    defaultArgs: "5",
    description: "Classic recursive factorial with base condition heuristic and step-by-step AST evaluation.",
    code: `fact :: Int -> Int
fact n = if n == 0 then 1 else n * fact (n - 1)
`
  },
  {
    id: "optimization_demo",
    title: "Algebraic Simplification",
    subtitle: "Folding & Identities",
    tag: "Optimizer",
    tagColor: "cyan",
    entryFunction: "optimizeMe",
    defaultArgs: "8",
    description: "Aggressive constant folding, zero addition, unit multiplication, and algebraic identity reductions.",
    code: `optimizeMe :: Int -> Int
optimizeMe x = (x * 1) + 0 + (12 * 4) + (2 + 3 * 2) * 0
`
  },
  {
    id: "dead_code",
    title: "Dead Branch Pruning",
    subtitle: "Static Condition",
    tag: "Optimization",
    tagColor: "amber",
    entryFunction: "filterBranch",
    defaultArgs: "14",
    description: "Evaluates known boolean condition statically, pruning the unexecutable else branch entirely.",
    code: `filterBranch :: Int -> Int
filterBranch x = if True then x * 2 else x + 9999
`
  },
  {
    id: "mutual_recursion",
    title: "Mutual Recursion",
    subtitle: "Tarjan SCC Call Cycle",
    tag: "Call Graph",
    tagColor: "purple",
    entryFunction: "isEven",
    defaultArgs: "6",
    description: "Pair of functions isEven and isOdd mutually calling each other. HaskOpt detects the cyclic strongly-connected component.",
    code: `isEven :: Int -> Bool
isEven n = if n == 0 then True else isOdd (n - 1)

isOdd :: Int -> Bool
isOdd n = if n == 0 then False else isEven (n - 1)
`
  },
  {
    id: "fibonacci",
    title: "Fibonacci Tree",
    subtitle: "Binary Recursion",
    tag: "Recursion",
    tagColor: "emerald",
    entryFunction: "fib",
    defaultArgs: "7",
    description: "Tree-recursive Fibonacci function showcasing multi-path recursive AST branches.",
    code: `fib :: Int -> Int
fib n = if n <= 1 then n else fib (n - 1) + fib (n - 2)
`
  },
  {
    id: "euclidean_gcd",
    title: "Euclidean GCD",
    subtitle: "Modulo & Tail Call",
    tag: "Algorithm",
    tagColor: "cyan",
    entryFunction: "gcd",
    defaultArgs: "48, 18",
    description: "Greatest Common Divisor using Euclid's algorithm with modulo arithmetic.",
    code: `gcd :: Int -> Int -> Int
gcd a b = if b == 0 then a else gcd b (a \`mod\` b)
`
  },
  {
    id: "diamond_call_graph",
    title: "Diamond Call Graph",
    subtitle: "Multi-Function Topology",
    tag: "Call Graph",
    tagColor: "indigo",
    entryFunction: "dispatch",
    defaultArgs: "10",
    description: "Multi-tier call graph with shared leaf nodes to test dependency topology visualization.",
    code: `dispatch :: Int -> Int
dispatch x = branchA x + branchB x

branchA :: Int -> Int
branchA x = sharedHelper (x * 2)

branchB :: Int -> Int
branchB x = sharedHelper (x + 5)

sharedHelper :: Int -> Int
sharedHelper n = n * 3 + 1
`
  },
  {
    id: "collatz_conjecture",
    title: "Collatz Sequence",
    subtitle: "Branching Steps Counter",
    tag: "Recursion",
    tagColor: "purple",
    entryFunction: "collatz",
    defaultArgs: "12, 0",
    description: "Counts 3n+1 sequence steps until reaching 1 using accumulator recursion.",
    code: `collatz :: Int -> Int -> Int
collatz n steps = if n <= 1 then steps else if (n \`mod\` 2) == 0 then collatz (n / 2) (steps + 1) else collatz (3 * n + 1) (steps + 1)
`
  },
  {
    id: "heavy_algebra",
    title: "Arithmetic Expression Tree",
    subtitle: "Full Constant Tree Folding",
    tag: "Optimizer",
    tagColor: "amber",
    entryFunction: "foldTree",
    defaultArgs: "50",
    description: "Deep constant arithmetic trees combined with identity patterns to demonstrate multi-pass reduction.",
    code: `foldTree :: Int -> Int
foldTree x = (100 * 2 + 50) - (80 / 4) + (x * 1) + (0 * 5) - (0 + x * 0)
`
  },
  {
    id: "power_accumulator",
    title: "Power Tail Recursion",
    subtitle: "Tail Position",
    tag: "Tail Call",
    tagColor: "emerald",
    entryFunction: "powerHelper",
    defaultArgs: "2, 8, 1",
    description: "Tail-recursive power function with accumulator, demonstrating multi-parameter evaluation.",
    code: `powerHelper :: Int -> Int -> Int -> Int
powerHelper b e acc = if e == 0 then acc else powerHelper b (e - 1) (acc * b)
`
  },
  {
    id: "boolean_ranges",
    title: "Boolean Precedence",
    subtitle: "Logical Operators",
    tag: "Type Check",
    tagColor: "rose",
    entryFunction: "checkRange",
    defaultArgs: "25",
    description: "Nested comparison and boolean operators (&&, ||) testing type checking and short-circuit logic.",
    code: `checkRange :: Int -> Bool
checkRange x = if x >= 10 && x <= 50 || x == 100 then True else False
`
  }
];
