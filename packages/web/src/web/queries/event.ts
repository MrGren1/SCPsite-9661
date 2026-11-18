import { orpc } from "../lib/api";
export const publicOptions = () => orpc.event.public.queryOptions();
export const inboxOptions = () => orpc.event.inbox.queryOptions();
export const materialsOptions = () => orpc.event.allMaterials.queryOptions();
export const applyOptions = () => orpc.event.apply.mutationOptions();
export const reviewOptions = () => orpc.event.review.mutationOptions();
export const saveOptions = () => orpc.event.saveMaterial.mutationOptions();

export const logOptions = (enabled: boolean) =>
  orpc.event.logs.queryOptions({ enabled });
export const configOptions = () => orpc.control.config.queryOptions();
export const saveConfigOptions = () =>
  orpc.control.saveConfig.mutationOptions();
export const allRolesOptions = () => orpc.control.roles.queryOptions();
export const saveRoleOptions = () => orpc.control.saveRole.mutationOptions();
export const deleteRoleOptions = () =>
  orpc.control.deleteRole.mutationOptions();
export const deleteMaterialOptions = () =>
  orpc.control.deleteMaterial.mutationOptions();
export const assignOptions = () => orpc.control.assign.mutationOptions();
