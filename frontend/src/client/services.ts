import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"

import type {
  Body_login_login_access_token,
  Message,
  NewPassword,
  Token,
  UserPublic,
  UpdatePassword,
  UserCreate,
  UserRegister,
  UsersPublic,
  UserUpdate,
  UserUpdateMe,
  ItemCreate,
  ItemPublic,
  ItemsPublic,
  ItemUpdate,
  SensorDataCreate,
  SensorDataUpdate,
  SensorDataPublic,
  SensorDataListPublic
} from "./models"

export type TDataLoginAccessToken = {
  formData: Body_login_login_access_token
}
export type TDataRecoverPassword = {
  email: string
}
export type TDataResetPassword = {
  requestBody: NewPassword
}
export type TDataRecoverPasswordHtmlContent = {
  email: string
}

export class LoginService {
  /**
   * Login Access Token
   * OAuth2 compatible token login, get an access token for future requests
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static loginAccessToken(
    data: TDataLoginAccessToken,
  ): CancelablePromise<Token> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/access-token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Test Token
   * Test access token
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static testToken(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/test-token",
    })
  }

  /**
   * Recover Password
   * Password Recovery
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPassword(
    data: TDataRecoverPassword,
  ): CancelablePromise<Message> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Reset Password
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPassword(
    data: TDataResetPassword,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reset-password/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Recover Password Html Content
   * HTML Content for Password Recovery
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContent(
    data: TDataRecoverPasswordHtmlContent,
  ): CancelablePromise<string> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadUsers = {
  limit?: number
  skip?: number
}
export type TDataCreateUser = {
  requestBody: UserCreate
}
export type TDataUpdateUserMe = {
  requestBody: UserUpdateMe
}
export type TDataUpdatePasswordMe = {
  requestBody: UpdatePassword
}
export type TDataRegisterUser = {
  requestBody: UserRegister
}
export type TDataReadUserById = {
  userId: string
}
export type TDataUpdateUser = {
  requestBody: UserUpdate
  userId: string
}
export type TDataDeleteUser = {
  userId: string
}

export class UsersService {
  /**
   * Read Users
   * Retrieve users.
   * @returns UsersPublic Successful Response
   * @throws ApiError
   */
  public static readUsers(
    data: TDataReadUsers = {},
  ): CancelablePromise<UsersPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create User
   * Create new user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static createUser(
    data: TDataCreateUser,
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User Me
   * Get current user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserMe(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Delete User Me
   * Delete own user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUserMe(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Update User Me
   * Update own user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUserMe(
    data: TDataUpdateUserMe,
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Password Me
   * Update own password.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updatePasswordMe(
    data: TDataUpdatePasswordMe,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me/password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Register User
   * Create new user without the need to be logged in.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static registerUser(
    data: TDataRegisterUser,
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User By Id
   * Get a specific user by id.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserById(
    data: TDataReadUserById,
  ): CancelablePromise<UserPublic> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update User
   * Update a user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUser(
    data: TDataUpdateUser,
  ): CancelablePromise<UserPublic> {
    const { requestBody, userId } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete User
   * Delete a user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataTestEmail = {
  emailTo: string
}

export class UtilsService {
  /**
   * Test Email
   * Test emails.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
    const { emailTo } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email/",
      query: {
        email_to: emailTo,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadItems = {
  limit?: number
  skip?: number
}
export type TDataCreateItem = {
  requestBody: ItemCreate
}
export type TDataReadItem = {
  id: string
}
export type TDataUpdateItem = {
  id: string
  requestBody: ItemUpdate
}
export type TDataDeleteItem = {
  id: string
}

export class ItemsService {
  /**
   * Read Items
   * Retrieve items.
   * @returns ItemsPublic Successful Response
   * @throws ApiError
   */
  public static readItems(
    data: TDataReadItems = {},
  ): CancelablePromise<ItemsPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Item
   * Create new item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static createItem(
    data: TDataCreateItem,
  ): CancelablePromise<ItemPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/items/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Item
   * Get item by ID.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static readItem(data: TDataReadItem): CancelablePromise<ItemPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Item
   * Update an item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static updateItem(
    data: TDataUpdateItem,
  ): CancelablePromise<ItemPublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Item
   * Delete an item.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteItem(data: TDataDeleteItem): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadSensorsData = {
  limit?: number
  skip?: number
}
export type TDataCreateSensorData = {
  requestBody: SensorDataCreate
}
export type TDataReadSensorData = {
  id: string
}
export type TDataReadSensorDataEquipment = {
  equipment_id: string
}
export type TDataUpdateSensorData = {
  id: string
  requestBody: SensorDataUpdate
}
export type TDataDeleteSensorData = {
  id: string
}

export enum TDataSensorDataFetchMode {
  LAST_24H = 1,
  LAST_48H = 2,
  LAST_WEEK = 3,
  LAST_MONTH = 4,
  CUSTOM = 5,
  ALL_TIME = 6
}

export type TDataSensorDataDashboardFetch = { 
  page?: number
  skip?: number
  limit: number
  fetch_mode: TDataSensorDataFetchMode
  begin_custom_date?: Date | null
  end_custom_date?: Date | null
  equipment_ids?: string[] | null
}

export type TDataSensorDataBarChartDashboardItem = {
  equipment_id: string
  avg: number
}

export type TDataSensorDataBarChartDashboard = {
  data: TDataSensorDataBarChartDashboardItem[]
  count: number
}

export type TDataSensorDataCsvImportStatus = {
  count_success: number
  count_fail: number
}

export type TDataOptionList = {
  data: TDataOption[]
}

export type TDataOption = {
  value: string
  label: string
}

export class SensorDataService {
  /**
   * Read Sensors Data
   * Retrieve sensors data.
   * @returns SensorDataListPublic Successful Response
   * @throws ApiError
   */
  public static readSensorsData(
    data: TDataReadSensorsData = {},
  ): CancelablePromise<SensorDataListPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sensor-data/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create SensorData
   * Create a new registry of sensor data.
   * @returns SensorDataPublic Successful Response
   * @throws ApiError
   */
  public static createSensorData(
    data: TDataCreateSensorData,
  ): CancelablePromise<SensorDataPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/sensor-data/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }
  
  /**
   * Read Sensor Data
   * Get sensor data by ID.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
   public static readSensorData(
    data: TDataReadSensorData
    ): CancelablePromise<ItemPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sensor-data/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Sensor Data
   * Get sensor data by equipment ID.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static readSensorDataByEquipment(
    data: TDataReadSensorDataEquipment
    ): CancelablePromise<ItemPublic> {
    const { equipment_id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sensor-data/equipment/{equipment_id}",
      path: {
        equipment_id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update SensorData
   * Update a sensor data registry.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static updateSensorData(
    data: TDataUpdateSensorData,
  ): CancelablePromise<SensorDataPublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/sensor-data/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Sensor Data
   * Delete a sensor data registry.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteSensorData(
    data: TDataDeleteSensorData
    ): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/sensor-data/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Retrieves sensor data for bar chart rendering
   * @returns TDataSensorDataBarChartDashboard Successful Response
   * @throws ApiError
   */
   public static readSensorDataDashboardBarChart(
    data: TDataSensorDataDashboardFetch,
  ): CancelablePromise<TDataSensorDataBarChartDashboard> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/sensor-data/dashboard/bar-chart",
      body: data,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }
  
  /**
   * Retrieves unique equipment id options.
   * @returns TDataOptionList Successful Response
   * @throws ApiError
   */
  public static readEquipmentOptions(): CancelablePromise<TDataOptionList> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sensor-data/options/equipment",
      errors: {
        422: `Validation Error`,
      },
    })
  }
  
  /**
   * Uploads a csv file and creates new sensor data registries based on it.
   * @returns TDataSensorDataBarChartDashboard Successful Response
   * @throws ApiError
   */
   public static importSensorDataCsv(
    data: any,
  ): CancelablePromise<TDataSensorDataCsvImportStatus> {
    console.log(data.data)
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/sensor-data/csv",
      mediaType: "multipart/form-data",
      formData: {
        sensor_data_csv_file: data.data
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
