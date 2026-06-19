/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "placeholder-org",
  project: "placeholder-project",
});
