<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Store architecture
- Use TanStack file routes with shared store components and a root cart provider so navigation preserves the shopping flow.
- Keep authoritative prices, stock, delivery settings, order creation and staff status transitions in transactional database functions; browser totals are estimates only.
- Restrict staff privileges through a separate user_roles table and RLS; guest tracking requires an unguessable receipt reference plus the order phone number.
- Keep unverified demonstration products distinct from live inventory and block their checkout until staff confirms them; never present invented inventory as real store facts.
