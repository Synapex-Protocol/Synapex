#!/bin/bash
# SYNAPEX Contracts — Setup for Foundry
set -e
echo "Installing Foundry dependencies..."
forge install foundry-rs/forge-std --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit
echo "Building..."
forge build
echo "Running tests..."
forge test
echo "Done."
