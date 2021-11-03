<?php
/**
* Storage
* https://docs.digitalocean.com/products/spaces/resources/s3-sdk-examples/
*/

namespace kvasbo\tellulf;

require 'vendor/autoload.php';
use Aws\S3\S3Client;

class s3 {
	
	private $client;
	
	public function __construct() {
		 $this->client = new \Aws\S3\S3Client([
			 'version' => 'latest',
			 'region'  => 'us-east-1',
			 'endpoint' => $_ENV["DO_SPACE_ENDPOINT"],
			 'credentials' => [
					 'key'    => $_ENV["DO_SPACE_KEY"],
					 'secret' => $_ENV["DO_SPACE_SECRET"],
			 ],
	 ]);
	}
	
	public function Store_Array(string $filename, array $content) {
		$this->Store($filename, json_encode($content));
	}
	
	public function Store(string $filename, string $content) {
		$this->client->putObject([
			 'Bucket' => 'tellulf',
			 'Key'    => $filename,
			 'Body'   => $content,
			 'ACL'    => 'private'
		]);
	}
		
}