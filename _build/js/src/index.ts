import { chatHistory } from './chatHistory';
import { executor } from './executor';
import { history } from './history';
import { initOnResource } from './resource';
import { ui } from './ui';
import { globalState } from './ui/localChat/state';

export type Config = {
  name?: string;
  apiURL: string;
  cssURL: string;
};

export const init = (config: Config) => {
  globalState.config = config;

  return {
    chatHistory,
    history,
    executor,
    ui,
    initOnResource,
  };
};
