import { useCycle, useEstimate, useLabel, useMember, useModule, useProjectState } from "./store";

export const useProjectIssueProperties = () => {
  const { fetchProjectStates } = useProjectState();
  const {
    project: { fetchProjectMembers },
  } = useMember();
  const { fetchProjectLabels } = useLabel();
  const { fetchAllCycles: fetchProjectAllCycles } = useCycle();
  const { fetchModules: fetchProjectAllModules } = useModule();
  const { fetchProjectEstimates } = useEstimate();

  // fetching project states
  const fetchStates = async (
    workspaceSlug: string | string[] | undefined,
    projectId: string | string[] | undefined
  ) => {
    if (workspaceSlug && projectId) {
      await fetchProjectStates(workspaceSlug.toString(), projectId.toString());
    }
  };
  // fetching project members
  const fetchMembers = async (
    workspaceSlug: string | string[] | undefined,
    projectId: string | string[] | undefined
  ) => {
    if (workspaceSlug && projectId) {
      await fetchProjectMembers(workspaceSlug.toString(), projectId.toString());
    }
  };

  // fetching project labels
  const fetchLabels = async (
    workspaceSlug: string | string[] | undefined,
    projectId: string | string[] | undefined
  ) => {
    if (workspaceSlug && projectId) {
      await fetchProjectLabels(workspaceSlug.toString(), projectId.toString());
    }
  };
  // fetching project cycles
  const fetchCycles = async (
    workspaceSlug: string | string[] | undefined,
    projectId: string | string[] | undefined
  ) => {
    if (workspaceSlug && projectId) {
      await fetchProjectAllCycles(workspaceSlug.toString(), projectId.toString());
    }
  };
  // fetching project modules
  const fetchModules = async (
    workspaceSlug: string | string[] | undefined,
    projectId: string | string[] | undefined
  ) => {
    if (workspaceSlug && projectId) {
      await fetchProjectAllModules(workspaceSlug.toString(), projectId.toString());
    }
  };
  // fetching project estimates
  const fetchEstimates = async (
    workspaceSlug: string | string[] | undefined,
    projectId: string | string[] | undefined
  ) => {
    if (workspaceSlug && projectId) {
      await fetchProjectEstimates(workspaceSlug.toString(), projectId.toString());
    }
  };
  return {
    fetchStates,
    fetchMembers,
    fetchLabels,
    fetchCycles,
    fetchModules,
    fetchEstimates,
  };
};
