-- A passenger may cancel an agreed ride that did not happen. Keep the lock order
-- consistent with confirmation and release: driver profile before request row.
create or replace function public.cancel_request(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare assigned_driver uuid; result_id uuid;
begin
  select driver_id into assigned_driver from public.requests
    where id = p_request_id and passenger_id = auth.uid()
      and status in ('open','offered','accepted');
  if assigned_driver is not null then
    perform 1 from public.driver_profiles where user_id = assigned_driver for update;
  end if;
  update public.requests
    set status = 'cancelled', driver_id = null, offered_at = null, accepted_at = null
    where id = p_request_id and passenger_id = auth.uid()
      and status in ('open','offered','accepted')
      and driver_id is not distinct from assigned_driver
    returning id into result_id;
  if result_id is null then raise exception 'mr_cancel_not_possible'; end if;
  return result_id;
end;
$$;

revoke all on function public.cancel_request(uuid) from public, anon;
grant execute on function public.cancel_request(uuid) to authenticated;
