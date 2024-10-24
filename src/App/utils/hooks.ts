import React from "react";
import { showToast } from "./helpers";
import { FirebaseError } from "firebase/app";
import { useTranslation } from "react-i18next";
import { UseToastOptions } from "@chakra-ui/react";

/**
 *
 * Start of `useServiceRequest`
 *
 */

type Service<Args, Response> = (args: Args) => Promise<Response>;
type SuccessCB<Response> = (response?: Response) => void;
type ErrorCB<Error> = (error?: Error) => void;
type Options<Args, Response, Error> = {
  args?: Args;
  isShowErrorToast?: boolean;
  isShowSuccessToast?: boolean;
  onError?: ErrorCB<Error>;
  onSuccess?: SuccessCB<Response>;
  errorToastOptions?: UseToastOptions;
  successToastOptions?: UseToastOptions;
};

type Trigger<Args, Response, Error> = (
  options?: Options<Args, Response, Error>
) => Promise<void>;
type ReturnOpt<Response, Error> = {
  data: Response | null;
  error: Error | null;
  isLoading: boolean;
  called: boolean;
};
type HookReturn<Args, Response, Error> = [
  Trigger<Args, Response, Error>,
  ReturnOpt<Response, Error>
];

/**
 * A custom React hook for making asynchronous service requests with flexible options.
 * @template Args - Type for arguments passed to the service function.
 * @template Response - Type for the response returned by the service function.
 *
 * @param {Service<Args, Response>} service - The asynchronous service function to be executed.
 * @param {Options<Args, Response>} [options={}] - Initial options for the service request.
 * @returns {[Trigger<Args, Response>, ReturnOpt<Response>]} A tuple containing the trigger function and state for data, error, and loading status.
 */
export const useServiceRequest = <Args, Response, Error = FirebaseError>(
  service: Service<Args, Response>,
  options: Options<Args, Response, Error> = {}
): HookReturn<Args, Response, Error> => {
  const { t } = useTranslation();
  const [called, setCalled] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<Response | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const trigger = async (
    triggerOptions: Options<Args, Response, Error> = {}
  ) => {
    setCalled(true);
    setIsLoading(true);
    const mergedOptions = { ...options, ...triggerOptions };
    const {
      args = [],
      successToastOptions = {},
      errorToastOptions = {},
    } = mergedOptions;
    try {
      setError(null);
      const data = await service(args as Args);
      setData(data as Response);
      mergedOptions?.isShowSuccessToast &&
        showToast({ status: "success", ...successToastOptions });
      mergedOptions?.onSuccess?.(data as Response);
    } catch (error) {
      setData(null);
      setError(error as Error);
      mergedOptions?.isShowErrorToast &&
        showToast({
          status: "error",
          description: error?.code ? t("toast." + (error as Error)?.code) : error?.message,
          ...errorToastOptions,
        });
      mergedOptions?.onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return [trigger, { data, error, called, isLoading }];
};

/**
 *
 * End of `useServiceRequest`
 *
 * Start of `useDidUpdateEffect`
 *
 */

export const useDidUpdateEffect = (
  effect: React.EffectCallback,
  deps?: React.DependencyList
) => {
  const isInitialRender = React.useRef(true);

  React.useEffect(() => {
    if (isInitialRender.current) isInitialRender.current = false;
    else effect();
  }, deps);
};

/**
 *
 * End of `useDidUpdateEffect`
 *
 */
