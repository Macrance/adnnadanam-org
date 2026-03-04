-- Allow any authenticated user to claim a pending donation (set recipient_id/recipient_name)
DROP POLICY IF EXISTS "Admins and involved users can update donations" ON public.donations;

CREATE POLICY "Admins and involved users can update donations"
ON public.donations
FOR UPDATE
TO authenticated
USING (
  donor_id = get_my_profile_id()
  OR volunteer_id = get_my_profile_id()
  OR recipient_id = get_my_profile_id()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (status = 'pending' AND recipient_id IS NULL)
);