# Cloudflare Setup Guide for Vercel Builds

This guide explains how to configure Cloudflare to allow Vercel build-time requests to access your Directus API.

## Option 1: Use Static Token (Recommended - Easiest)

This is the simplest solution. Static tokens bypass Cloudflare's bot protection because they're authenticated requests.

### Steps:

1. **Create a Static Token in Directus:**
   - Log into your Directus admin panel
   - Go to **Settings** > **Access Tokens**
   - Click **Create Token**
   - Give it a name like "Vercel Build Token"
   - Set permissions to read-only for the collections you need (globals, redirects)
   - Copy the token

2. **Add Token to Vercel Environment Variables:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** > **Environment Variables**
   - Add a new variable:
     - **Name:** `DIRECTUS_STATIC_TOKEN`
     - **Value:** Your static token from step 1
     - **Environment:** Production, Preview, Development (or just Production)
   - Save

3. **That's it!** The code will automatically use this token during builds.

---

## Option 2: Whitelist Vercel IP Addresses in Cloudflare

If you prefer not to use a static token, you can whitelist Vercel's build IP addresses.

### Step 1: Enable Vercel Static IPs (Optional but Recommended)

Vercel offers Static IPs for Enterprise plans. For other plans, Vercel uses dynamic IPs that change.

**For Enterprise Plans:**
1. Go to Vercel Dashboard > Your Project > **Settings** > **Connectivity**
2. Enable **Static IPs** for your region
3. Note the IP addresses provided

**For Other Plans:**
Vercel doesn't provide static IPs, but you can find their IP ranges. However, this is less reliable.

### Step 2: Whitelist IPs in Cloudflare

#### Method A: Using IP Access Rules (Recommended)

1. **Log into Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select your domain (`app.tsx.vn`)

2. **Navigate to Security > WAF**
   - Click on **Tools** tab
   - Find **IP Access Rules**

3. **Add IP Access Rule**
   - Click **Add rule**
   - **IP Address:** Enter the Vercel static IP (or IP range)
   - **Action:** Select **Allow**
   - **Note:** Add a description like "Vercel Build IPs"
   - Click **Add**

4. **For Multiple IPs:** Repeat step 3 for each IP address

#### Method B: Using WAF Custom Rules

1. **Go to Security > WAF**
2. Click **Custom rules** tab
3. Click **Create rule**
4. Configure:
   - **Rule name:** "Allow Vercel Builds"
   - **When incoming requests match:**
     - **Field:** `IP Source Address`
     - **Operator:** `is in`
     - **Value:** Enter Vercel IP addresses (comma-separated)
   - **Then:** `Skip all remaining custom rules`
5. Click **Deploy**

#### Method C: Adjust Security Level (Less Secure)

⚠️ **Not Recommended** - This reduces security for all requests

1. **Go to Security > Settings**
2. **Security Level:** Set to **Medium** or **Low**
3. **Bot Fight Mode:** Toggle **Off**
4. **Challenge Passage:** Increase to 30 minutes

---

## Option 3: Use Cloudflare Access Rules (Alternative)

1. **Go to Security > WAF > Tools**
2. Click **IP Access Rules**
3. Add rules for Vercel IPs with **Allow** action

---

## Finding Vercel IP Addresses

### For Static IPs (Enterprise):
- Check your Vercel project settings > Connectivity

### For Dynamic IPs:
Vercel's build IPs are not publicly documented, but you can:
1. Check your Cloudflare firewall logs during a build
2. Look for blocked requests from Vercel
3. Note the IP addresses and whitelist them

### Common Vercel Regions and IPs:
Vercel uses AWS infrastructure. Common regions:
- **US East (iad1):** Various AWS IPs
- **US West:** Various AWS IPs
- **EU:** Various AWS IPs

**Note:** Without Static IPs, this approach is unreliable as IPs can change.

---

## Recommended Approach

**Use Option 1 (Static Token)** because:
- ✅ Easiest to set up
- ✅ Most reliable
- ✅ Works regardless of IP changes
- ✅ More secure (token-based authentication)
- ✅ No Cloudflare configuration needed

---

## Testing

After implementing either solution:

1. Trigger a new Vercel build
2. Check the build logs
3. You should see successful Directus API calls instead of 403 errors

---

## Troubleshooting

### Still Getting 403 Errors?

1. **Check token permissions:** Ensure the static token has read access to `globals` and `redirects` collections
2. **Verify environment variable:** Make sure `DIRECTUS_STATIC_TOKEN` is set in Vercel
3. **Check Cloudflare logs:** Review Security > Events to see why requests are blocked
4. **Try IP whitelisting:** If token doesn't work, try Option 2

### Token Not Working?

- Verify the token is valid in Directus
- Check token hasn't expired
- Ensure token has correct permissions
- Make sure environment variable name matches exactly

