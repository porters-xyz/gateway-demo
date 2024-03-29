export interface IApp {
  id: string;
  name: string;
  description: string;
  appId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrg {
  id: string;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  enterpriseId: string;
}

export interface ISession {
  chainId?: number;
  address?: string;
  id?: string;
  active?: boolean;
  createdAt?: string;
  orgs?: IOrg[] | null;
}
