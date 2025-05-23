import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/en-gb': {
        target: 'https://amazon.jobs',
        changeOrigin: true,
        secure: false,
      },
      '/search': {
        target: 'https://gcsservices.careers.microsoft.com',
        changeOrigin: true,
        secure: false,
      },
      '/netflix': {
        target: 'https://explore.jobs.netflix.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/netflix/, '')
      },
      '/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.secondaryLocations,flexFieldsFacet.values,requisitionList.requisitionFlexFields&finder=findReqs;siteNumber=CX_1001': {
        target: 'https://jpmc.fa.oraclecloud.com',
        changeOrigin: true,
        secure: false,
      },
      '/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.secondaryLocations,flexFieldsFacet.values,requisitionList.requisitionFlexFields&finder=findReqs;siteNumber=CX_45001': {
        target: 'https://eeho.fa.us2.oraclecloud.com',
        changeOrigin: true,
        secure: false,
      },
      '/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?expand=all&onlyData=true&finder=ById;siteNumber=CX_45001': {
        target: 'https://eeho.fa.us2.oraclecloud.com',
        changeOrigin: true,
        secure: false,
      },
      '/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?expand=all&onlyData=true&finder=ById;siteNumber=CX_1001': {
        target: 'https://jpmc.fa.oraclecloud.com',
        changeOrigin: true,
        secure: false,
      },
      '/paypal': {
        target: 'https://paypal.eightfold.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/paypal/, '')
      },
      '/AMD': {
        target: 'https://careers.amd.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/AMD/, '')
      },
      '/GitHub': {
        target: 'https://www.github.careers',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/GitHub/, '')
      },
      '/endpoint': {
        target: 'https://www.atlassian.com',
        changeOrigin: true,
        secure: false,
      },
      '/Rippling': {
        target: 'https://www.rippling.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/Rippling/, '')
      },
      '/qualcomm': {
        target: 'https://careers.qualcomm.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qualcomm/, '')
      },
      '/v1': {
        target: 'https://api.greenhouse.io',  // Replace with your actual API base URL
        changeOrigin: true,
        secure: false, // Set to false if the API server uses a self-signed certificate
      },
      '/morganstanley': {
        target: 'https://morganstanley.eightfold.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/morganstanley/, '')
      },
      '/makemytrip': {
        target: 'https://careers.makemytrip.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/makemytrip/, '')
      },
      '/siemens': {
        target: 'https://jobs.siemens.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/siemens/, '')
      },
      '/americanExpress': {
        target: 'https://aexp.eightfold.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/americanExpress/, '')
      },
      '/juniperNetworks': {
        target: 'https://jobs.juniper.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/juniperNetworks/, '')
      },
      '/rest': {
        target: 'https://www.thoughtworks.com',  // Replace with your actual API base URL
        changeOrigin: true,
        secure: false, // Set to false if the API server uses a self-signed certificate
      },
      '/deshaw': {
        target: 'https://www.apply.deshaw.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deshaw/, '')
      },
      '/palantir': {
        target: 'https://www.palantir.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/palantir/, '')
      },
      '/spaceX': {
        target: 'https://boards-api.greenhouse.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/spaceX/, '')
      },
    },
  },
  plugins: [react()],
});
