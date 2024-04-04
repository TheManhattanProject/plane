import { observer } from "mobx-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR, { mutate } from "swr";
// icons
import { RefreshCw } from "lucide-react";
// types
import { IImporterService } from "@plane/types";
// ui
import { Button } from "@plane/ui";
// components
import { EmptyState } from "@/components/empty-state";
import { DeleteImportModal, GithubImporterRoot, JiraImporterRoot, SingleImport } from "@/components/integration";
import { ImportExportSettingsLoader } from "@/components/ui";
// constants
import { EmptyStateType } from "@/constants/empty-state";
import { IMPORTER_SERVICES_LIST } from "@/constants/fetch-keys";
import { IMPORTERS_LIST } from "@/constants/workspace";
// hooks
import { useUser } from "@/hooks/store";
import useUserAuth from "@/hooks/use-user-auth";
// services
import { IntegrationService } from "@/services/integrations";

// services
const integrationService = new IntegrationService();

const IntegrationGuide = observer(() => {
  // states
  const [refreshing, setRefreshing] = useState(false);
  const [deleteImportModal, setDeleteImportModal] = useState(false);
  const [importToDelete, setImportToDelete] = useState<IImporterService | null>(null);
  // router
  const router = useRouter();
  const { workspaceSlug, provider } = router.query;
  // store hooks
  const { data: currentUser, isLoading: currentUserLoader } = useUser();
  // custom hooks
  const {} = useUserAuth({ user: currentUser || null, isLoading: currentUserLoader });

  const { data: importerServices } = useSWR(
    workspaceSlug ? IMPORTER_SERVICES_LIST(workspaceSlug as string) : null,
    workspaceSlug ? () => integrationService.getImporterServicesList(workspaceSlug as string) : null
  );

  const handleDeleteImport = (importService: IImporterService) => {
    setImportToDelete(importService);
    setDeleteImportModal(true);
  };

  return (
    <>
      <DeleteImportModal
        isOpen={deleteImportModal}
        handleClose={() => setDeleteImportModal(false)}
        data={importToDelete}
        user={currentUser || null}
      />
      <div className="h-full">
        {(!provider || provider === "csv") && (
          <>
            {/* <div className="mb-5 flex items-center gap-2">
              <div className="h-full w-full space-y-1">
                <div className="text-lg font-medium">Relocation Guide</div>
                <div className="text-sm">
                  You can now transfer all the issues that you{"'"}ve created in other tracking
                  services. This tool will guide you to relocate the issue to Plane.
                </div>
              </div>
              <a
                href="https://docs.plane.so/importers/github"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium text-[#3F76FF] hover:text-opacity-80">
                  Read More
                  <ArrowRightIcon width={"18px"} color={"#3F76FF"} />
                </div>
              </a>
            </div> */}
            {IMPORTERS_LIST.map((service) => (
              <div
                key={service.provider}
                className="flex items-center justify-between gap-2 border-b border-custom-border-100 bg-custom-background-100 px-4 py-6"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image src={service.logo} layout="fill" objectFit="cover" alt={`${service.title} Logo`} />
                  </div>
                  <div>
                    <h3 className="flex items-center gap-4 text-sm font-medium">{service.title}</h3>
                    <p className="text-sm tracking-tight text-custom-text-200">{service.description}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link href={`/${workspaceSlug}/settings/imports?provider=${service.provider}`}>
                    <span>
                      <Button variant="primary">{service.type}</Button>
                    </span>
                  </Link>
                </div>
              </div>
            ))}
            <div>
              <div className="flex items-center border-b border-custom-border-100 pb-3.5 pt-7">
                <h3 className="flex gap-2 text-xl font-medium">
                  Previous Imports
                  <button
                    type="button"
                    className="flex flex-shrink-0 items-center gap-1 rounded bg-custom-background-80 px-1.5 py-1 text-xs outline-none"
                    onClick={() => {
                      setRefreshing(true);
                      mutate(IMPORTER_SERVICES_LIST(workspaceSlug as string)).then(() => setRefreshing(false));
                    }}
                  >
                    <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />{" "}
                    {refreshing ? "Refreshing..." : "Refresh status"}
                  </button>
                </h3>
              </div>
              <div className="flex flex-col">
                {importerServices ? (
                  importerServices.length > 0 ? (
                    <div className="space-y-2">
                      <div className="divide-y divide-custom-border-200">
                        {importerServices.map((service) => (
                          <SingleImport
                            key={service.id}
                            service={service}
                            refreshing={refreshing}
                            handleDelete={() => handleDeleteImport(service)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <EmptyState type={EmptyStateType.WORKSPACE_SETTINGS_IMPORT} size="sm" />
                    </div>
                  )
                ) : (
                  <ImportExportSettingsLoader />
                )}
              </div>
            </div>
          </>
        )}

        {provider && provider === "github" && <GithubImporterRoot />}
        {provider && provider === "jira" && <JiraImporterRoot />}
      </div>
    </>
  );
});

export default IntegrationGuide;
