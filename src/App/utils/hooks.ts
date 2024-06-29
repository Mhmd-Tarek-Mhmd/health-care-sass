import React from "react";
import { showToast } from "./helpers";
import { useTranslation } from "react-i18next";
import { UseToastOptions } from "@chakra-ui/react";

/**
 *
 * Start of `useServiceRequest`
 *
 */

type Service<Args, Response> = (args: Args) => Promise<Response>;
type SuccessErrCB<Response> = (response?: Response) => void;
type Options<Args, Response> = {
  args?: Args;
  isShowErrorToast?: boolean;
  isShowSuccessToast?: boolean;
  onError?: SuccessErrCB<unknown>;
  onSuccess?: SuccessErrCB<Response>;
  errorToastOptions?: UseToastOptions;
  successToastOptions?: UseToastOptions;
};

type Trigger<Args, Response> = (
  options?: Options<Args, Response>
) => Promise<void>;
type ReturnOpt<Response> = {
  data: Response | null;
  error: unknown;
  isLoading: boolean;
};
type HookReturn<Args, Response> = [
  Trigger<Args, Response>,
  ReturnOpt<Response>
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
export const useServiceRequest = <Args, Response>(
  service: Service<Args, Response>,
  options: Options<Args, Response> = {}
): HookReturn<Args, Response> => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<unknown>(null);
  const [data, setData] = React.useState<Response | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const trigger = async (triggerOptions: Options<Args, Response> = {}) => {
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
      setData(data);
      options?.isShowSuccessToast &&
        showToast({ status: "success", ...successToastOptions });
      mergedOptions?.onSuccess?.(data);
    } catch (error) {
      setData(null);
      setError(error);
      options?.isShowErrorToast &&
        showToast({
          status: "error",
          description: t(error?.code),
          ...errorToastOptions,
        });
      mergedOptions?.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return [trigger, { data, error, isLoading }];
};

/**
 *
 * End of `useServiceRequest`
 *
 */
