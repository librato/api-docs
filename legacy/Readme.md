# Legacy Redirects

This folder contains redirects for our old Kb and Support site. It uses `S3_website` https://github.com/laurilehmijoki/s3_website to create all of the redirects. 

For these two buckets. 

	- dev.librato.com -> http://dev.librato.com.s3-website-us-east-1.amazonaws.com
	- support.metrics.librato.com -> http://support.metrics.librato.com.s3-website-us-east-1.amazonaws.com 

To re-apply run `s3_website push`. 