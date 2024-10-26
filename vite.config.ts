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
      '/_next': {
        target: 'https://www.rippling.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
