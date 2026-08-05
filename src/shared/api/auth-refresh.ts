export type AuthExpiredListener = () => void;

export interface AuthRefreshCoordinator {
  refresh(): Promise<boolean>;
}

const authExpiredListeners = new Set<AuthExpiredListener>();

const emitAuthExpired = (): void => {
  for (const listener of authExpiredListeners) listener();
};

export const onAuthExpired = (listener: AuthExpiredListener): (() => void) => {
  authExpiredListeners.add(listener);
  return () => authExpiredListeners.delete(listener);
};

export const createAuthRefreshCoordinator = (options: {
  refresh: () => Promise<void>;
  onExpired?: () => void;
}): AuthRefreshCoordinator => {
  let inFlight: Promise<boolean> | undefined;

  return {
    refresh() {
      if (inFlight) return inFlight;

      inFlight = options
        .refresh()
        .then(() => true)
        .catch(() => {
          (options.onExpired ?? emitAuthExpired)();
          return false;
        })
        .finally(() => {
          inFlight = undefined;
        });

      return inFlight;
    },
  };
};
