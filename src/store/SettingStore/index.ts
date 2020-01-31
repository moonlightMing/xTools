import { action, computed, observable } from 'mobx';
import NewDB from 'src/util/DataDB';
import { ObjectStoreType } from './type';

const dbParams = {
  dbName: 'setting',
  encryption: true,
  defaultValue: {
    global: {
      autoStart: false,
      siderMenuCollapse: true,
    },
    auth: {
      enable: false,
      password: '',
      afkLockEnable: false,
      afkTime: 10
    },
    cloudSync: {
      autoAsync: false,
      cloudAuthChecked: false,
      objectStoreType: Object.values(ObjectStoreType)[0],
      bucket: '',
      region: '',
      secretId: '',
      secretKey: '',
    }
  }
}

export class SettingStore {

  private SettingDB: any;

  /**
   * 基础配置
   */
  @observable private autoStart: boolean;
  @observable private siderMenuCollapse: boolean;

  /**
   * 云同步
   */
  @observable private cloudAuthChecked: boolean;
  @observable private autoAsync: boolean;
  @observable private objectStoreType: ObjectStoreType;
  @observable private bucket: string;
  @observable private region: string;
  @observable private secretId: string;
  @observable private secretKey: string;


  /**
   * 密码锁
   */
  @observable private enableAuthCheck: boolean;
  @observable private curAuthPassword: string;
  @observable private afkLockEnable: boolean;
  @observable private afkTime: number;

  constructor() {
    this.reloadStore();
  }

  @action
  public reloadStore() {
    this.SettingDB = NewDB(dbParams);

    this.autoStart = this.getSettingDBValue('global.autoStart');
    this.siderMenuCollapse = this.getSettingDBValue('global.siderMenuCollapse');

    this.cloudAuthChecked = this.getSettingDBValue('cloudSync.cloudAuthChecked');
    this.autoAsync = this.getSettingDBValue('cloudSync.autoAsync');
    this.objectStoreType = this.getSettingDBValue('cloudSync.objectStoreType');
    this.bucket = this.getSettingDBValue('cloudSync.bucket');
    this.region = this.getSettingDBValue('cloudSync.region');
    this.secretId = this.getSettingDBValue('cloudSync.secretId');
    this.secretKey = this.getSettingDBValue('cloudSync.secretKey');

    this.enableAuthCheck = this.getSettingDBValue('auth.enable');
    this.curAuthPassword = this.getSettingDBValue('auth.password');
    this.afkLockEnable = this.getSettingDBValue('auth.afkLockEnable');
    this.afkTime = this.getSettingDBValue('auth.afkTime')
  }

  @computed
  public get AfkLockEnable(): boolean {
    return this.afkLockEnable;
  }

  @action
  public setAfkLockEnable(value: boolean) {
    this.setSettingDBValue('auth.afkLockEnable', value);
    this.afkLockEnable = value;
  }

  @computed
  public get AfkTime(): number {
    return this.afkTime;
  }

  @action
  public setAfkTime(t: number) {
    this.setSettingDBValue('auth.afkTime', t);
    this.afkTime = t;
  }

  @computed
  public get EnableAuthCheck(): boolean {
    return this.enableAuthCheck;
  }

  @action
  public setEnableAuthCheck(value: boolean) {
    this.setSettingDBValue('auth.enable', value)
    this.enableAuthCheck = value;
  }

  @computed
  public get CurAuthPassword(): string {
    return this.curAuthPassword;
  }

  @action
  public setCurAuthPassword(pwd: string) {
    this.setSettingDBValue('auth.password', pwd);
    this.curAuthPassword = pwd;
  }

  @action
  public toggleSiderMenuCollapse() {
    this.setSettingDBValue('global.siderMenuCollapse', !this.siderMenuCollapse);
    this.siderMenuCollapse = !this.siderMenuCollapse;
  }

  @computed
  public get SiderMenuCollapse(): boolean {
    return this.siderMenuCollapse;
  }

  @action
  public setCloudAuthChecked(value: boolean) {
    this.cloudAuthChecked = value;
    this.setSettingDBValue('cloudSync.cloudAuthChecked', value)
  }

  @computed
  public get CloudAuthChecked(): boolean {
    return this.cloudAuthChecked;
  }

  @computed
  public get curObjectStoreType(): ObjectStoreType {
    return this.objectStoreType;
  }

  @action
  public setObjectStoreType(osType: ObjectStoreType) {
    this.setSettingDBValue('cloudSync.objectStoreType', osType)
  }

  @action
  public setAutoStart(value: boolean) {
    this.setSettingDBValue('global.autoStart', value);
    this.autoStart = value;
  }

  @computed
  public get AutoStart(): boolean {
    return this.autoStart;
  }

  @action
  public setAutoAsync(value: boolean) {
    this.setSettingDBValue('cloudSync.autoAsync', value);
    this.autoAsync = value;
  }

  @computed
  public get AutoAsync(): boolean {
    return this.autoAsync;
  }

  @computed
  public get SecretId() {
    return this.secretId;
  }

  @computed
  public get Bucket() {
    return this.bucket;
  }

  @computed
  public get Region() {
    return this.region;
  }

  @computed
  public get SecretKey() {
    return this.secretKey;
  }

  @action
  public setBucket(bucket: string) {
    this.setSettingDBValue('cloudSync.bucket', bucket);
    this.bucket = bucket;
  }

  @action
  public setRegion(region: string) {
    this.setSettingDBValue('cloudSync.region', region);
    this.region = region;
  }

  @action
  public setSecretId(secretId: string) {
    this.setSettingDBValue('cloudSync.secretId', secretId);
    this.secretId = secretId;
  }

  @action
  public setSecretKey(secretKey: string) {
    this.setSettingDBValue('cloudSync.secretKey', secretKey);
    this.secretKey = secretKey;
  }

  private getSettingDBValue(key: string): any {
    return this.SettingDB.get(key).value();
  }

  private setSettingDBValue(key: string, value: any) {
    this.SettingDB.set(key, value).write();
  }
}

export default new SettingStore();