## Environment variables

".env.local" : using config for local to development.
".env.development" : using config deploy to development environment.
".env.staging" : using config deploy to staging environment

**Variables**

- REACT_APP_PLATFORM_ID :
  0-AdminWebsite
  1-AdminMobileApp
  2-POSWebsite
  3-POSMobileApp
  4-StoreWebsite
  5-StoreMobileApp
  6-OrderWebsite
  7-OrderWobileApp

- REACT_APP_ROOT_DOMAIN : The api domain name url
- REACT_APP_API : <api_domain_name_url> + "/api/"
  Example:
  App root domain is: https://api.fnb.com/
  App api is: https://api.fnb.com/api/

- REACT_APP_ENV :
  dev: development environment
  staging: staging environment

- PUBLIC_URL : default is ""
- REACT_APP_INSTRUMENTATION_KEY : The key for azure application insights
