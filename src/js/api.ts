import { isClient, isDev, env } from './helpers';
import { api as apiConfig } from '../../config/app.config.json';

export const apiResponseMessages = {
  login: {
    invalid: 'Bad credentials.',
    token: 'Expired JWT Token',
    tokenInvalid: 'Invalid JWT Token',
    tokenRefresh: 'Refresh token ',
  },
  register: {
    exists: 'User already exists',
  },
  sms: {
    invalid: 'Invalid secret code',
  },
  subscription: {
    already: 'User is already subscribed.',
  },
};
export type TApiMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const { production } = apiConfig.host;
const apiHost: string = (apiConfig.host as any)[env] || production;
const apiUrl: string = '/v0/';
const config = {
  headers: {
    Authorization: '',
  },
};
let apiToken = '';
let apiTokenRefresh = '';
let isApiTokenRefreshing = false;
let apiActiveCalls = 0;

export const isSuccess = (response: Response) =>
  response && response.status >= 200 && response.status < 300;

// tslint:disable:no-console
export const apiErrorCheck = async (
  status: number,
  data: any,
  apiPath: string,
  authorizationHeader: string,
  isFullPath?: boolean,
  requestParams?: any,
): Promise<any> => {
  if (status === 404) {
    if (isDev) {
      console.error(`Not found: ${apiPath}`);
    }

    return null;
  }

  if (!data) {
    if (isDev) {
      console.error('unknown server error');
    }

    return null;
  }

  let errorSource =
    data.non_field_errors || typeof data === 'object'
      ? Object.values(data)
      : data;

  if (Array.isArray(errorSource[0])) {
    errorSource = errorSource[0];
  }

  const error = errorSource[0] || data;

  if (status === 401) {
    if (
      authorizationHeader &&
      authorizationHeader === config.headers.Authorization
    ) {
      apiTokenSet('');
    }

    const isTokenExpired = data.message === apiResponseMessages.login.token;
    const isRefreshTokenExpired = new RegExp(
      `^${apiResponseMessages.login.tokenRefresh}`,
    ).test(error);

    if (isTokenExpired) {
      await apiGetTokenRefresh();
    }

    if (authorizationHeader) {
      // repeat request
      return apiSend(apiPath, requestParams, isFullPath);
    }

    if (isRefreshTokenExpired) {
      apiTokenSet('', true);
    }
  }

  if (isDev) {
    console.error(error);
  }

  throw error;
};

const apiGetTokenRefresh = async () => {
  try {
    if (isApiTokenRefreshing) {
      await waitTokenRefreshing();
    } else if (apiTokenRefresh) {
      isApiTokenRefreshing = true;

      const { token, refresh_token: refresh } = await apiPost('token/refresh', {
        refresh_token: apiTokenRefresh,
      });

      apiTokenSet(token);
      apiTokenSet(refresh, true);
    }
  } catch (error) {
    if (isDev) {
      console.error(error);
    }
  }

  isApiTokenRefreshing = false;
};

const waitTokenRefreshing = () =>
  new Promise((onSuccess) => {
    const interval = setInterval(() => {
      if (!isApiTokenRefreshing) {
        clearInterval(interval);
        onSuccess();
      }
    }, 0);
  });

export const isApiTokenExists = () => !!apiToken;

export const getApiPath = () => `${apiHost}${apiUrl}`;

export const apiSend = async (
  apiPath: string,
  params: any = {},
  isFullPath = false,
  method: TApiMethods = 'GET',
) => {
  const isGet = method === 'GET';
  let url = `${isFullPath ? '' : `${getApiPath()}`}${apiPath}`;
  let response: Response;
  let data: any;
  const requestConfig: any = { ...config, method };
  const authorizationHeader = config.headers.Authorization;

  requestConfig.headers = { ...config.headers };

  const isFormData = params && Object.values(params).some(param => param instanceof Blob);

  if (isFormData) {
    const formData = new FormData();

    Object.keys(params).forEach(key => formData.append(key, params[key]));

    requestConfig.headers['Content-Type'] = 'multipart/form-data';
    requestConfig.body = formData;
  } else {
    requestConfig.headers['Content-Type'] = 'application/json';

    if (method === 'GET') {
      const getParams = Object.keys(params).map(key => `${key}=${params[key]}`);

      url += getParams.length ? `?${getParams.join('&')}` : '';
    } else {
      requestConfig.body = JSON.stringify(params);
    }
  }

  try {
    response = await fetch(url, requestConfig);
    data = await response.json();
  } catch (error) {
    if (!error.response) {
      if (isGet) {
        apiActiveCalls--;
      }

      if (isDev) {
        console.error(error);
      }

      if (error instanceof SyntaxError) {
        throw Error('Непредвиденная ошибка сервера');
      }

      throw error;
    }

    response = error.response;
  }

  if (isGet) {
    apiActiveCalls--;
  }

  return isSuccess(response)
    ? data
    : await apiErrorCheck(
      response.status,
      data,
      apiPath,
      authorizationHeader,
      isFullPath,
      params,
    );
};

export const apiGet = async (apiPath: string) => await apiSend(apiPath);

export const apiPost = async (
  apiPath: string,
  params: any = {},
  isFullPath = false,
) => await apiSend(apiPath, params, isFullPath, 'POST');

export const apiPatch = async (
  apiPath: string,
  params: any = {},
  isFullPath = false,
) => await apiSend(apiPath, params, isFullPath, 'PATCH');

export const apiPut = async (
  apiPath: string,
  params: any = {},
  isFullPath = false,
) => await apiSend(apiPath, params, isFullPath, 'PUT');

export const apiDelete = async (apiPath: string, isFullPath = false) =>
  await apiSend(apiPath, {}, isFullPath, 'DELETE');

export const apiTokenSet = (token: string, refresh?: boolean) => {
  const tokenStorageKey = refresh ? 'token_refresh' : 'token';

  if (refresh) {
    apiTokenRefresh = token;
  } else {
    apiToken = token;
  }

  if (token) {
    if (!refresh) {
      config.headers.Authorization = `Token ${apiToken}`;
    }

    localStorage.setItem(tokenStorageKey, token);
  } else {
    localStorage.removeItem(tokenStorageKey);
    delete config.headers.Authorization;
  }
};

export const apiTokenGet = (refresh?: boolean) => {
  const token: string = isClient
    ? localStorage.getItem(refresh ? 'token_refresh' : 'token')
    : '';

  if (token) {
    apiTokenSet(token, refresh);
  }

  return token;
};

export const apiHasActiveCalls = () => !!apiActiveCalls;

apiToken = apiTokenGet();
apiTokenRefresh = apiTokenGet(true);
