/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    HF_TOKEN: process.env.HF_TOKEN,
    HF_DATASET: process.env.HF_DATASET,
  },
};

module.exports = nextConfig;