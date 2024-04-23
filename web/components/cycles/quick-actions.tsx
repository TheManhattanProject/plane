import { useState } from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
// icons
import { ArchiveRestoreIcon, ExternalLink, LinkIcon, Pencil, Trash2 } from "lucide-react";
// ui
import { ArchiveIcon, ContextMenu, CustomMenu, TContextMenuItem, TOAST_TYPE, setToast } from "@plane/ui";
// components
import { ArchiveCycleModal, CycleCreateUpdateModal, CycleDeleteModal } from "@/components/cycles";
// constants
import { EUserProjectRoles } from "@/constants/project";
// helpers
import { copyUrlToClipboard } from "@/helpers/string.helper";
// hooks
import { useCycle, useEventTracker, useUser } from "@/hooks/store";

type Props = {
  parentRef: React.RefObject<HTMLElement>;
  cycleId: string;
  projectId: string;
  workspaceSlug: string;
};

export const CycleQuickActions: React.FC<Props> = observer((props) => {
  const { parentRef, cycleId, projectId, workspaceSlug } = props;
  // router
  const router = useRouter();
  // states
  const [updateModal, setUpdateModal] = useState(false);
  const [archiveCycleModal, setArchiveCycleModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  // store hooks
  const { setTrackElement } = useEventTracker();
  const {
    membership: { currentWorkspaceAllProjectsRole },
  } = useUser();
  const { getCycleById, restoreCycle } = useCycle();
  // derived values
  const cycleDetails = getCycleById(cycleId);
  const isArchived = !!cycleDetails?.archived_at;
  const isCompleted = cycleDetails?.status?.toLowerCase() === "completed";
  // auth
  const isEditingAllowed =
    !!currentWorkspaceAllProjectsRole && currentWorkspaceAllProjectsRole[projectId] >= EUserProjectRoles.MEMBER;

  const cycleLink = `${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`;
  const handleCopyText = () =>
    copyUrlToClipboard(cycleLink).then(() => {
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Link Copied!",
        message: "Cycle link copied to clipboard.",
      });
    });
  const handleOpenInNewTab = () => window.open(`/${cycleLink}`, "_blank");

  const handleEditCycle = () => {
    setTrackElement("Cycles page list layout");
    setUpdateModal(true);
  };

  const handleArchiveCycle = () => setArchiveCycleModal(true);

  const handleRestoreCycle = async () =>
    await restoreCycle(workspaceSlug, projectId, cycleId)
      .then(() => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Restore success",
          message: "Your cycle can be found in project cycles.",
        });
        router.push(`/${workspaceSlug}/projects/${projectId}/archives/cycles`);
      })
      .catch(() =>
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: "Cycle could not be restored. Please try again.",
        })
      );

  const handleDeleteCycle = () => {
    setTrackElement("Cycles page list layout");
    setDeleteModal(true);
  };

  const MENU_ITEMS: TContextMenuItem[] = [
    {
      key: "copy-link",
      action: handleCopyText,
      title: "Copy link",
      icon: LinkIcon,
      shouldRender: !isArchived,
    },
    {
      key: "open-new-tab",
      action: handleOpenInNewTab,
      title: "Open in new tab",
      icon: ExternalLink,
      shouldRender: !isArchived,
    },
    {
      key: "edit",
      title: "Edit",
      icon: Pencil,
      action: handleEditCycle,
      shouldRender: isEditingAllowed && !isCompleted && !isArchived,
    },
    {
      key: "archive",
      action: handleArchiveCycle,
      title: "Archive",
      description: isCompleted ? undefined : "Only completed cycle can\nbe archived.",
      icon: ArchiveIcon,
      className: "items-start",
      iconClassName: "mt-1",
      shouldRender: isEditingAllowed && !isArchived,
      disabled: !isCompleted,
    },
    {
      key: "restore",
      action: handleRestoreCycle,
      title: "Restore",
      icon: ArchiveRestoreIcon,
      shouldRender: isEditingAllowed && isArchived,
    },
    {
      key: "delete",
      action: handleDeleteCycle,
      title: "Delete",
      icon: Trash2,
      shouldRender: isEditingAllowed && !isCompleted && !isArchived,
    },
  ];

  return (
    <>
      {cycleDetails && (
        <div className="fixed">
          <CycleCreateUpdateModal
            data={cycleDetails}
            isOpen={updateModal}
            handleClose={() => setUpdateModal(false)}
            workspaceSlug={workspaceSlug}
            projectId={projectId}
          />
          <ArchiveCycleModal
            workspaceSlug={workspaceSlug}
            projectId={projectId}
            cycleId={cycleId}
            isOpen={archiveCycleModal}
            handleClose={() => setArchiveCycleModal(false)}
          />
          <CycleDeleteModal
            cycle={cycleDetails}
            isOpen={deleteModal}
            handleClose={() => setDeleteModal(false)}
            workspaceSlug={workspaceSlug}
            projectId={projectId}
          />
        </div>
      )}
      <ContextMenu parentRef={parentRef} items={MENU_ITEMS} />
      <CustomMenu ellipsis placement="bottom-end">
        {MENU_ITEMS.map((item) => {
          if (item.shouldRender === false) return null;
          return (
            <CustomMenu.MenuItem
              key={item.key}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.action();
              }}
              className="flex items-center gap-2"
            >
              {item.icon && <item.icon className="h-3 w-3" />}
              {item.title}
            </CustomMenu.MenuItem>
          );
        })}
      </CustomMenu>
    </>
  );
});
