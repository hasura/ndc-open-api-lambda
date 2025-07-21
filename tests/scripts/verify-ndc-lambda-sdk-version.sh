#!/usr/bin/env bash
set -euo pipefail

# Script to verify that NDC_NODEJS_LAMBDA_SDK_VERSION in context.ts matches
# the version in connector-definition/.hasura-connector/Dockerfile

# We need this check because the nodejs connector version is tightly coupled
# with the version of ndc-lambda-sdk, and the two versions should be the same
# for the nodejs connector to work correctly

CONTEXT_FILE="src/app/context.ts"
DOCKERFILE="connector-definition/.hasura-connector/Dockerfile"

# Function to check version consistency between files
check_version_consistency() {
    echo "=== Checking NDC Lambda SDK version consistency ==="

    # Extract version from context.ts
    local context_version=$(grep -E "const NDC_NODEJS_LAMBDA_SDK_VERSION = " "$CONTEXT_FILE" | sed -E 's/.*"([^"]+)".*/\1/')

    # Extract version from Dockerfile
    local dockerfile_version=$(grep -E "FROM ghcr.io/hasura/ndc-nodejs-lambda:" "$DOCKERFILE" | sed -E 's/.*:([^[:space:]]+).*/\1/')

    echo "Context.ts version: $context_version"
    echo "Dockerfile version: $dockerfile_version"

    if [ "$context_version" = "$dockerfile_version" ]; then
        echo "✅ Versions match!"
        return 0
    else
        echo "❌ Version mismatch detected!"
        echo "The NDC_NODEJS_LAMBDA_SDK_VERSION in $CONTEXT_FILE is '$context_version'"
        echo "The ghcr.io/hasura/ndc-nodejs-lambda version in $DOCKERFILE is '$dockerfile_version'"
        echo ""
        echo "Please update one of the files to ensure the versions match:"
        echo "  - Update NDC_NODEJS_LAMBDA_SDK_VERSION in $CONTEXT_FILE, or"
        echo "  - Update the FROM statement in $DOCKERFILE"
        return 1
    fi
}

# Function to check if the npm package version is downloadable
check_version_downloadable() {
    echo ""
    echo "=== Checking if npm package version is downloadable ==="

    # Extract version from context.ts (remove 'v' prefix if present)
    local context_version=$(grep -E "const NDC_NODEJS_LAMBDA_SDK_VERSION = " "$CONTEXT_FILE" | sed -E 's/.*"([^"]+)".*/\1/' | sed 's/^v//')
    local package_name="@hasura/ndc-lambda-sdk"

    echo "Checking if npm package exists: $package_name@$context_version"

    # Use npm view to check if the package version exists
    # This checks the npm registry without downloading the package
    if npm view "$package_name@$context_version" version >/dev/null 2>&1; then
        echo "✅ npm package $package_name@$context_version is available and downloadable!"
        return 0
    else
        echo "❌ npm package $package_name@$context_version is not available or not downloadable!"
        echo "Please verify that:"
        echo "  - The version $context_version exists for $package_name in the npm registry"
        echo "  - You have proper access to the npm registry"
        echo "  - The version tag is correctly formatted"
        return 1
    fi
}

# Main execution
main() {
    local exit_code=0

    # Run version consistency check
    if ! check_version_consistency; then
        exit_code=1
    fi

    # Run downloadable version check
    if ! check_version_downloadable; then
        exit_code=1
    fi

    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "🎉 All checks passed!"
    else
        echo ""
        echo "💥 One or more checks failed!"
    fi

    exit $exit_code
}

# Run main function
main
