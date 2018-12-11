import { InjectionToken } from '@angular/core';

const graphcollID = 'cjp0chfflkxk80156e729lkcw';

export interface GraphcollConfig {
  simpleAPI: string;
  subscriptionsAPI: string;
  fileAPI: string;
  fileDownloadURL: string;
}

export const graphcollConfig: GraphcollConfig = {
  simpleAPI: `https://api.graph.cool/simple/v1/${graphcollID}`,
  subscriptionsAPI: `wss://subscriptions.graph.cool/v1/${graphcollID}`,
  fileAPI: `https://api.graph.cool/file/v1/${graphcollID}`,
  fileDownloadURL: `https://files.graph.cool/${graphcollID}`
};

export const GRAPHCOOL_CONFIG = new InjectionToken<GraphcollConfig>(
  'graphcool.config',
  {
    providedIn: 'root',
    factory: () => {
      return graphcollConfig;
    }
  }
);
