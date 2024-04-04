"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { observer } from "mobx-react-lite";
import useSWR from "swr";
// hooks
import useInstance from "hooks/use-instance";
// ui
import { Loader, ToggleSwitch, setPromiseToast } from "@plane/ui";
// components
import { AuthenticationMethodCard, InstanceGithubConfigForm } from "components/authentication";
// icons
import githubLightModeImage from "/public/logos/github-black.png";
import githubDarkModeImage from "/public/logos/github-white.png";
// helpers
import { resolveGeneralTheme } from "helpers/common.helper";

const InstanceGithubAuthenticationPage = observer(() => {
  // store
  const { fetchInstanceConfigurations, formattedConfig, updateInstanceConfigurations } = useInstance();
  // state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // theme
  const { resolvedTheme } = useTheme();
  // config
  const enableGithubConfig = formattedConfig?.IS_GITHUB_ENABLED ?? "";

  useSWR("INSTANCE_CONFIGURATIONS", () => fetchInstanceConfigurations());

  const updateConfig = async (key: "IS_GITHUB_ENABLED", value: string) => {
    setIsSubmitting(true);

    const payload = {
      [key]: value,
    };

    const updateConfigPromise = updateInstanceConfigurations(payload);

    setPromiseToast(updateConfigPromise, {
      loading: "Saving Configuration...",
      success: {
        title: "Configuration saved",
        message: () => `Github authentication is now ${value ? "active" : "disabled"}.`,
      },
      error: {
        title: "Error",
        message: () => "Failed to save configuration",
      },
    });

    await updateConfigPromise
      .then(() => {
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
      });
  };
  return (
    <div className="flex flex-col gap-4 max-w-6xl pb-6 md:px-2">
      <div className="flex items-center gap-4 mb-2 border-b border-custom-border-100 pb-3">
        <AuthenticationMethodCard
          name="Github"
          description="Allow members to login or sign up to plane with their Github accounts."
          icon={
            <Image
              src={resolveGeneralTheme(resolvedTheme) === "dark" ? githubDarkModeImage : githubLightModeImage}
              height={24}
              width={24}
              alt="GitHub Logo"
            />
          }
          config={
            <ToggleSwitch
              value={Boolean(parseInt(enableGithubConfig))}
              onChange={() => {
                Boolean(parseInt(enableGithubConfig)) === true
                  ? updateConfig("IS_GITHUB_ENABLED", "0")
                  : updateConfig("IS_GITHUB_ENABLED", "1");
              }}
              size="sm"
              disabled={isSubmitting || !formattedConfig}
            />
          }
          disabled={isSubmitting || !formattedConfig}
          withBorder={false}
        />
      </div>
      {formattedConfig ? (
        <InstanceGithubConfigForm config={formattedConfig} />
      ) : (
        <Loader className="space-y-8">
          <Loader.Item height="50px" width="25%" />
          <Loader.Item height="50px" />
          <Loader.Item height="50px" />
          <Loader.Item height="50px" />
          <Loader.Item height="50px" width="50%" />
        </Loader>
      )}
    </div>
  );
});

export default InstanceGithubAuthenticationPage;