// ! ReadSync
export interface PendingReadUpdate {
  userId: number;
  chatId: number;
  segNumber: number;
}

export interface ReadSyncBatch {
  batchId: string;
  updates: PendingReadUpdate[];
}
