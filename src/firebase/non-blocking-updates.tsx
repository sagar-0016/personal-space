
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  CollectionReference,
  DocumentReference,
  SetOptions,
  Firestore,
  doc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data,
      })
    )
  })
}

export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}

/**
 * Creates a project and automatically attaches an 'Unlabelled' label.
 */
export async function createProjectWithDefaultLabel(db: Firestore, userId: string, name: string) {
  const projectsRef = collection(db, 'users', userId, 'projects');
  try {
    const projectDoc = await addDoc(projectsRef, {
      name,
      createdAt: Date.now()
    });
    
    const labelsRef = collection(db, 'users', userId, 'projects', projectDoc.id, 'labels');
    await addDoc(labelsRef, {
      name: 'Unlabelled',
      isDefault: true
    });
    
    return projectDoc.id;
  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: projectsRef.path,
        operation: 'create',
      })
    )
    return null;
  }
}

export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}

export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}

/**
 * Deletes a project and all its sub-collection labels.
 */
export async function deleteProjectAndLabels(db: Firestore, userId: string, projectId: string) {
  const projectRef = doc(db, 'users', userId, 'projects', projectId);
  const labelsRef = collection(db, 'users', userId, 'projects', projectId, 'labels');
  
  try {
    // Delete all labels first
    const labelsSnapshot = await getDocs(query(labelsRef));
    labelsSnapshot.forEach((labelDoc) => {
      deleteDoc(labelDoc.ref);
    });
    
    // Delete the project itself
    await deleteDoc(projectRef);
  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: projectRef.path,
        operation: 'delete',
      })
    );
  }
}
