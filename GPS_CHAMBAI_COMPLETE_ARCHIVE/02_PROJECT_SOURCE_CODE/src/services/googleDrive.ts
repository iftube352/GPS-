import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts'
];

// In-memory cache for the access token (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let tokenExpiryTime: number | null = null;
let tokenRefreshPromise: Promise<string> | null = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
    tokenExpiryTime = null;
    tokenRefreshPromise = null;
  }
});

export async function signInWithGoogleDrive(): Promise<{ user: User; token: string | null }> {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach(scope => provider.addScope(scope));

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  if (credential?.accessToken) {
    cachedAccessToken = credential.accessToken;
    tokenExpiryTime = Date.now() + 50 * 60 * 1000;
  }

  return { user: result.user, token: cachedAccessToken };
}

export async function signOutFromGoogleDrive(): Promise<void> {
  cachedAccessToken = null;
  tokenExpiryTime = null;
  tokenRefreshPromise = null;
  await firebaseSignOut(auth);
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedAccessToken;
  }

  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = (async () => {
    try {
      const provider = new GoogleAuthProvider();
      SCOPES.forEach(scope => provider.addScope(scope));

      if (auth.currentUser?.email) {
        provider.setCustomParameters({
          login_hint: auth.currentUser.email
        });
      }

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken) {
        throw new Error('Failed to retrieve OAuth access token from Google.');
      }

      cachedAccessToken = credential.accessToken;
      tokenExpiryTime = Date.now() + 50 * 60 * 1000;
      return cachedAccessToken;
    } finally {
      tokenRefreshPromise = null;
    }
  })();

  return tokenRefreshPromise;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
}

export const GoogleDriveService = {
  async uploadBackupToDrive(filename: string, jsonContent: string): Promise<DriveFileItem> {
    let token = await getAccessToken();

    const metadata = {
      name: filename,
      mimeType: 'application/json',
      description: 'GPS Chambai Kohat Full School Database Backup'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([jsonContent], { type: 'application/json' }));

    let response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      }
    );

    if (response.status === 401) {
      token = await getAccessToken(true);
      response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: form
        }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive upload failed: ${errText}`);
    }

    return await response.json();
  },

  async listSchoolBackupsFromDrive(): Promise<DriveFileItem[]> {
    let token = await getAccessToken();
    const query = encodeURIComponent("name contains 'GPS_Chambai' and mimeType = 'application/json' and trashed = false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=10&fields=files(id,name,mimeType,modifiedTime,size)`;

    let response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      token = await getAccessToken(true);
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    if (!response.ok) {
      throw new Error('Failed to list backup files from Google Drive');
    }

    const data = await response.json();
    return data.files || [];
  },

  async downloadBackupFromDrive(fileId: string): Promise<string> {
    let token = await getAccessToken();
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    let response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      token = await getAccessToken(true);
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    if (!response.ok) {
      throw new Error('Failed to download backup file from Google Drive');
    }

    return await response.text();
  }
};
