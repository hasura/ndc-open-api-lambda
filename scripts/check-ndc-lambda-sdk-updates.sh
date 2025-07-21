#!/usr/bin/env bash
set -euo pipefail

# Script to manually check for NDC Lambda SDK updates
# This mirrors the logic in the GitHub workflow for local testing

CONTEXT_FILE="src/app/context.ts"
DOCKERFILE="connector-definition/.hasura-connector/Dockerfile"

echo "🔍 Checking for NDC Lambda SDK updates..."

# Get current version from context.ts
CURRENT_VERSION=$(grep -E "const NDC_NODEJS_LAMBDA_SDK_VERSION = " "$CONTEXT_FILE" | sed -E 's/.*"([^"]+)".*/\1/')
echo "Current version in context.ts: $CURRENT_VERSION"

# Get latest release from GitHub API
echo "Fetching latest release from GitHub..."
LATEST_VERSION=$(curl -s https://api.github.com/repos/hasura/ndc-nodejs-lambda/releases/latest | jq -r '.tag_name')
echo "Latest release: $LATEST_VERSION"

# Compare versions
if [ "$CURRENT_VERSION" = "$LATEST_VERSION" ]; then
    echo "✅ Already up to date: $CURRENT_VERSION"
    exit 0
else
    echo "🔄 Update available: $CURRENT_VERSION -> $LATEST_VERSION"
fi

# Check if we have GitHub CLI available for PR checking
if command -v gh &> /dev/null; then
    echo "Checking for existing PRs..."
    PR_TITLE="chore: update NDC Lambda SDK to $LATEST_VERSION"

    # Check if PR already exists (requires gh auth)
    if gh auth status &> /dev/null; then
        EXISTING_PR=$(gh pr list --state open --search "in:title \"update NDC Lambda SDK to $LATEST_VERSION\"" --json number --jq '.[0].number // empty' 2>/dev/null || echo "")

        if [ -n "$EXISTING_PR" ]; then
            echo "✅ PR already exists: #$EXISTING_PR"
            echo "🔗 View PR: $(gh pr view $EXISTING_PR --json url --jq '.url')"
            exit 0
        else
            echo "🆕 No existing PR found"
        fi
    else
        if [ "${RUNNING_IN_CI:-false}" = "true" ]; then
            echo "❌ GitHub CLI not authenticated in CI environment"
            echo "This is required for automated PR creation"
            exit 1
        else
            echo "⚠️  GitHub CLI not authenticated - skipping PR check"
        fi
    fi
else
    if [ "${RUNNING_IN_CI:-false}" = "true" ]; then
        echo "❌ GitHub CLI not available in CI environment"
        echo "This is required for automated PR creation"
        exit 1
    else
        echo "⚠️  GitHub CLI not available - skipping PR check"
    fi
fi

# Get release notes
echo "Fetching release notes..."
RELEASE_NOTES=$(curl -s https://api.github.com/repos/hasura/ndc-nodejs-lambda/releases/latest | jq -r '.body // "No release notes available"')

echo ""
echo "📝 Release Notes for $LATEST_VERSION:"
echo "----------------------------------------"
echo "$RELEASE_NOTES"
echo "----------------------------------------"
echo ""

echo "🔗 Release URL: https://github.com/hasura/ndc-nodejs-lambda/releases/tag/$LATEST_VERSION"
echo ""
if [ "${RUNNING_IN_CI:-false}" = "true" ]; then
    echo "Running in CI environment - automated PR creation should proceed if no existing PR found."
else
    echo "To update manually:"
    echo "1. Update NDC_NODEJS_LAMBDA_SDK_VERSION in $CONTEXT_FILE to \"$LATEST_VERSION\""
    echo "2. Update FROM line in $DOCKERFILE to use ghcr.io/hasura/ndc-nodejs-lambda:$LATEST_VERSION"
    echo "3. Run tests to verify the update works"
    echo ""
    echo "Or wait for the automated workflow to create a PR (runs daily at 9 AM UTC)."
fi
