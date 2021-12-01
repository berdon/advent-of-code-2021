# Advent of Code 2021

## Getting Started

1. Open the root directory in VS Code
2. Open a problem typescript file (eg. `./01.ts`)
3. Replace the value of `AOC_AUTHN_COOKIES` with your session cookie value (see below)
4. Press `F5` to see the output

## How to get your advent of code session cookie value

Load [advent of code](https://adventofcode.com) with the devloper console open on the network tab. Inspect the GET request for `adventofcode.com` and find the request header for `Cookie`. The value should look something like: `session=53616c7465645f5fd59b2b6650b020709861e627asdfasd7493f145d4993fcaa81c1aa791b6f6e5f706352d6a26b0`. Copy this value as the string value for `AOC_AUTHN_COOKIES`.
