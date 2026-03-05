
-- Add UPDATE policy for storage objects (needed for file operations)
DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;
CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND is_admin(auth.uid()))
WITH CHECK (bucket_id = 'documents' AND is_admin(auth.uid()));
